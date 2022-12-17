import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test-utils'
import AuthorizerImpl from '../../authorizer/Authorizer'
import AbstractPermissionTest from '../support/AbstractPermissionTest'

@fake.login()
export default class AuthorizerInSkillContextTest extends AbstractPermissionTest {
	@test()
	protected static async canCreateAuthorizerInSkillContext() {
		const skill = await this.SkillFromTestDir('installed-skill')
		await this.bootSkill({ skill })
		const { authorizer } = skill.getContext()
		assert.isTrue(authorizer instanceof AuthorizerImpl)
	}
}
