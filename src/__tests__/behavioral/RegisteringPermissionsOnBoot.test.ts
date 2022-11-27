import { Skill } from '@sprucelabs/spruce-skill-utils'
import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractPermissionTest from '../support/AbstractPermissionTest'
import { SyncPermissionsTargetAndPayload } from '../support/EventFaker'

@fake.login()
export default class RegisteringPermissionsOnBootTest extends AbstractPermissionTest {
	private static skill: Skill

	protected static async beforeEach() {
		await super.beforeEach()
		this.skill = await this.SkillFromTestDir('installed-skill')
	}

	@test()
	protected static async canCreateRegisteringPermissionsOnBoot() {
		await this.assertAttemptedRegistration(true)
	}

	@test()
	protected static async registersPermissionsFromCombinedFile() {
		const contract = this.generateContractValues(['hey', 'there'])
		this.saveContracts([contract])

		let passedPayload: SyncPermissionsTargetAndPayload['payload'] | undefined

		await this.eventFaker.fakeRegisterPermissionContracts(({ payload }) => {
			passedPayload = payload
		})

		await this.boot()

		assert.isEqualDeep(passedPayload?.contracts, [contract])
	}

	@test()
	protected static async doesNotHitIfEnvDisabled() {
		process.env.SHOULD_REGISTER_PERMISSIONS = 'false'
		await this.assertAttemptedRegistration(false)
	}

	private static async assertAttemptedRegistration(expected: boolean) {
		let wasHit = false
		await this.eventFaker.fakeRegisterPermissionContracts(() => {
			wasHit = true
		})

		await this.boot()

		assert.isEqual(wasHit, expected)
		return wasHit
	}

	private static async boot() {
		await this.bootSkill({ skill: this.skill })
	}
}
