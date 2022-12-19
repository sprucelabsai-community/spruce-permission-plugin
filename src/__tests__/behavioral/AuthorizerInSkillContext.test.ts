import { AuthorizerFactory } from '@sprucelabs/spruce-permission-utils'
import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractPermissionTest from '../support/AbstractPermissionTest'

@fake.login()
export default class AuthorizerInSkillContextTest extends AbstractPermissionTest {
	@test()
	protected static async dropsAuthorizerInSkillContext() {
		const skill = await this.SkillFromTestDir('installed-skill')
		await this.bootSkill({ skill })
		const { authorizer } = skill.getContext()
		const expected = AuthorizerFactory.getInstance()
		assert.isEqual(authorizer, expected)
	}
}
