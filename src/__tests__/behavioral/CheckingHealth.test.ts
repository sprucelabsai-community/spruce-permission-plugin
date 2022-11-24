import {
	BootCallback,
	HealthCheckItem,
	Skill,
	SkillFeature,
} from '@sprucelabs/spruce-skill-utils'
import { fake } from '@sprucelabs/spruce-test-fixtures'
import { AbstractSpruceFixtureTest } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test-utils'

@fake.login()
export default class CheckingHealthTest extends AbstractSpruceFixtureTest {
	@test()
	protected static async canCreateCheckingHealth() {
		assert.isFunction(plugin)
	}

	@test()
	protected static async isNotInHealthCheckIfNotInstalled() {
		const health = await this.checkHealth('not-installed-skill')
		assert.isFalsy(health.permission)
	}

	@test()
	protected static async isInHealthCheckIfInstalled() {
		const health = await this.checkHealth('installed-skill')
		assert.isTruthy(health.permission)
	}

	private static async checkHealth(testDir: string) {
		const skill = await this.SkillFromTestDir(testDir)
		const health = await skill.checkHealth()
		return health
	}

	protected static Skill(options?: SkillFactoryOptions) {
		const { plugins = [plugin] } = options ?? {}

		return super.Skill({
			plugins,
			...options,
		})
	}
}

function plugin(skill: Skill) {
	const feature = new PermissionFeature(skill)
	skill.registerFeature('view', feature)
}

class PermissionFeature implements SkillFeature {
	public constructor(skill: Skill) {}

	public async execute(): Promise<void> {
		throw new Error('Method not implemented.')
	}
	public async checkHealth(): Promise<HealthCheckItem> {
		throw new Error('Method not implemented.')
	}
	public async isInstalled(): Promise<boolean> {
		throw new Error('Method not implemented.')
	}
	public async destroy(): Promise<void> {
		throw new Error('Method not implemented.')
	}
	public isBooted(): boolean {
		throw new Error('Method not implemented.')
	}
	public onBoot(cb: BootCallback): void {
		throw new Error('Method not implemented.')
	}
}
