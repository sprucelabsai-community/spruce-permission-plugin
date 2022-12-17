import {
	Authorizer,
	AuthorizerCanOptions,
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

	private constructor(connectToApi: ConnectToApi) {
		this.connectToApi = connectToApi
	}

	public static Authorizer(connectToApi: ConnectToApi) {
		assertOptions({ connectToApi }, ['connectToApi'])
		return new this(connectToApi)
	}

	public async can<Id extends PermissionContractId>(
		options: AuthorizerCanOptions<Id>
	): Promise<Record<PermissionId<Id>, boolean>> {
		const { contractId, permissionIds, target } = assertOptions(
			options as AuthorizerCanOptions<Id>,
			['contractId', 'permissionIds']
		)

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
