import { AuthorizerFactory } from '@sprucelabs/spruce-permission-utils'
import { Skill, SkillContext } from '@sprucelabs/spruce-skill-utils'
import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractPermissionTest from '../support/AbstractPermissionTest'

@fake.login()
export default class AuthInSkillContextTest extends AbstractPermissionTest {
    private static skill: Skill
    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()
        this.skill = await this.SkillFromTestDir('installed-skill')
        await this.bootSkill({ skill: this.skill })
    }

    @test()
    protected static async dropsAuthorizerInSkillContext() {
        const { authorizer } = this.getContent()
        const expected = AuthorizerFactory.getInstance()
        assert.isEqual(authorizer, expected)
    }

    private static getContent(): SkillContext {
        return this.skill.getContext()
    }
}
