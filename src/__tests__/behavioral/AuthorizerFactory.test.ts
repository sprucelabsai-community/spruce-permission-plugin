import {
	Authorizer,
	AuthorizerCanOptions,
} from '@sprucelabs/heartwood-view-controllers'
import { PermissionContractId, PermissionId } from '@sprucelabs/mercury-types'
import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert, errorAssert } from '@sprucelabs/test-utils'
import AuthorizerFactory from '../../authorizer/AuthorizerFactory'
import AbstractPermissionTest from '../support/AbstractPermissionTest'

@fake.login()
export default class AuthorizerFactoryTest extends AbstractPermissionTest {
	@test()
	protected static async throwsWhenMissingRequired() {
		const err = await assert.doesThrowAsync(() =>
			//@ts-ignore
			AuthorizerFactory.Authorizer()
		)

		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: ['connectToApi'],
		})
	}

	@test()
	protected static async canSetAnyClassToTheFactory() {
		AuthorizerFactory.setClass(StubAuthorizer)
		const auth = AuthorizerFactory.Authorizer(() => this.mercury.connectToApi())
		assert.isTrue(auth instanceof StubAuthorizer)
	}
}

class StubAuthorizer implements Authorizer {
	public async can<
		ContractId extends PermissionContractId,
		Ids extends PermissionId<ContractId>
	>(): Promise<Record<Ids, boolean>> {
		return {} as any
	}
}
