import {
	Authorizer,
	AuthorizerCanOptions,
	Scope,
} from '@sprucelabs/heartwood-view-controllers'
import { MercuryClient } from '@sprucelabs/mercury-client'
import {
	PermissionContractId,
	PermissionId,
	SpruceSchemas,
} from '@sprucelabs/mercury-types'
import { assertOptions } from '@sprucelabs/schema'
import SpruceError from './errors/SpruceError'

export default class AuthorizerImpl implements Authorizer {
	private connectToApi: ConnectToApi
	private scope: Scope

	private constructor(connectToApi: ConnectToApi, scope: Scope) {
		this.scope = scope
		this.connectToApi = connectToApi
	}

	public static Authorizer(connectToApi: ConnectToApi, scope: Scope) {
		assertOptions({ connectToApi, scope }, ['connectToApi', 'scope'])
		return new this(connectToApi, scope)
	}

	public async can<Id extends PermissionContractId>(
		options: AuthorizerCanOptions<Id>
	): Promise<Record<PermissionId<Id>, boolean>> {
		const { contractId, permissionIds } = assertOptions(
			options as AuthorizerCanOptions<Id>,
			['contractId', 'permissionIds']
		)

		const target: GetResolvedContractTargetAndPayload['target'] = {}

		const location = await this.scope.getCurrentLocation()
		if (location) {
			target.locationId = location.id
		} else {
			const organization = await this.scope.getCurrentOrganization()
			target.organizationId = organization?.id
		}

		const client = await this.connectToApi()
		const [{ resolvedContract }] = await client.emitAndFlattenResponses(
			'get-resolved-permissions-contract::v2020_12_25',
			{
				target,
				payload: {
					contractId,
				},
			}
		)

		const { permissions } = resolvedContract
		const results: Record<string, boolean> = {}

		permissionIds.forEach((id) => {
			const match = permissions.find((p) => p.id === id)
			if (!match) {
				throw new SpruceError({ code: 'PERMISSION_NOT_FOUND', id })
			}
			results[id] = match?.can
		})

		return results
	}
}

export type ConnectToApi = () => Promise<MercuryClient>
export type GetResolvedContractTargetAndPayload =
	SpruceSchemas.Mercury.v2020_12_25.GetResolvedPermissionsContractEmitTargetAndPayload
