import { PermissionContractId, PermissionId } from '@sprucelabs/mercury-types'
import { fake, seed } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert, generateId } from '@sprucelabs/test-utils'
import AuthorizerImpl, {
	GetResolvedContractTargetAndPayload,
} from '../../Authorizer'
import AbstractPermissionTest from '../support/AbstractPermissionTest'

@fake.login()
export default class AuthorizerTest extends AbstractPermissionTest {
	private static auth: AuthorizerImpl
	private static contractId: string

	protected static async beforeEach() {
		await super.beforeEach()
		this.auth = AuthorizerImpl.Authorizer(async () => fake.getClient())
		this.contractId = generateId()

		await this.eventFaker.fakeGetResolvedPermissionsContract()
	}

	@test()
	protected static async throwsWhenMissingRequired() {
		const err = await assert.doesThrowAsync(() =>
			//@ts-ignore
			AuthorizerImpl.Authorizer()
		)

		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: ['connectToApi'],
		})
	}

	@test()
	protected static async canThrowsWhenMisingRequired() {
		const err = await assert.doesThrowAsync(() =>
			//@ts-ignore
			this.auth.can()
		)

		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: ['contractId', 'permissionIds'],
		})
	}

	@test()
	protected static async makesExpectedRequest() {
		const passedTargetAndPayload = await this.getTargetAndPayload()

		assert.isEqualDeep(passedTargetAndPayload?.payload, {
			contractId: this.contractId,
		})
	}

	@test()
	@seed('organizations', 1)
	protected static async passesCurrentOrgInTarget() {
		const passedTargetAndPayload = await this.getTargetAndPayload({
			organizationId: this.fakedOrganizations[0].id,
		})
		assert.isEqualDeep(passedTargetAndPayload?.target, {
			organizationId: this.fakedOrganizations[0].id,
		})
	}

	@test()
	@seed('locations', 1)
	protected static async passesCurrentLocationInTarget() {
		const passedTargetAndPayload = await this.getTargetAndPayload({
			locationId: this.fakedLocations[0].id,
		})
		assert.isEqualDeep(passedTargetAndPayload?.target, {
			locationId: this.fakedLocations[0].id,
		})
	}

	@test()
	protected static async returnsSingleResponse() {
		this.fakeResponse([this.perm('test', true)])
		await this.assertResults(['test'], {
			test: true,
		})
	}

	@test()
	protected static async returnsManyResponse() {
		this.fakeResponse([this.perm('test', true), this.perm('test2', true)])
		await this.assertResults(['test', 'test2'], {
			test: true,
			test2: true,
		})
	}

	@test()
	protected static async returnsOnlythosePassed() {
		this.fakeResponse([this.perm('test', true), this.perm('test2', true)])
		await this.assertResults(['test'], {
			test: true,
		})
	}

	@test()
	protected static async passesBackProperCan() {
		this.fakeResponse([
			this.perm('test', false),
			this.perm('test3', false),
			this.perm('test2', true),
		])
		await this.assertResults(['test', 'test2'], {
			test: false,
			test2: true,
		})
	}

	@test()
	protected static async throwsIfPermNotFound() {
		this.fakeResponse([
			this.perm('test', false),
			this.perm('test3', false),
			this.perm('test2', true),
		])

		const badId = generateId()

		const err = await assert.doesThrowAsync(() => this.can(['test', badId]))
		errorAssert.assertError(err, 'PERMISSION_NOT_FOUND', {
			id: badId,
		})
	}

	private static async assertResults(
		ids: string[],
		expected: Record<string, any>
	) {
		const results = await this.can(ids)
		assert.isEqualDeep(results, expected)
	}

	private static perm(id: string, can: boolean): { id: string; can: boolean } {
		return {
			id,
			can,
		}
	}

	private static fakeResponse(permissions: { id: string; can: boolean }[]) {
		this.eventFaker.setGetResolvedContractResponse({
			contractId: this.contractId,
			permissions,
		})
	}

	private static async getTargetAndPayload(target?: Target) {
		let passedTargetAndPayload: ResolvedTargetAndPayload | undefined

		await this.eventFaker.fakeGetResolvedPermissionsContract(
			(targetAndPayload) => {
				passedTargetAndPayload = targetAndPayload
			}
		)

		await this.can([], target)
		return passedTargetAndPayload
	}

	private static async can(permissionIds: string[], target?: Target) {
		return await this.auth.can({
			contractId: this.contractId as PermissionContractId,
			permissionIds: permissionIds as PermissionId<PermissionContractId>[],
			target: target ?? undefined,
		})
	}
}

type ResolvedTargetAndPayload = GetResolvedContractTargetAndPayload
type Target = ResolvedTargetAndPayload['target']
