import { PermissionContract } from '@sprucelabs/mercury-types'
import { EventFeature } from '@sprucelabs/spruce-event-plugin'
import {
	AuthService,
	BootCallback,
	diskUtil,
	SettingsService,
	Skill,
	SkillFeature,
} from '@sprucelabs/spruce-skill-utils'
import { PermissionHealthCheckItem } from './permission.types'
import buildPermissionContractId from './utilities/buildPermissionContractId'
import permissionDiskUtil from './utilities/permissionDiskUtil'

export class PermissionFeature implements SkillFeature {
	private skill: Skill
	private bootHandler?: BootCallback
	public constructor(skill: Skill) {
		this.skill = skill
	}

	public async execute(): Promise<void> {
		if (this.shouldRegisterPermissions()) {
			const events = this.skill.getFeatureByCode('event') as EventFeature
			const client = await events.connectToApi()
			const contracts = this.importContracts()

			await client.emitAndFlattenResponses(
				'sync-permission-contracts::v2020_12_25',
				{
					payload: {
						contracts,
					},
				}
			)
		}
		await this.bootHandler?.()
	}

	private shouldRegisterPermissions() {
		return process.env.SHOULD_REGISTER_PERMISSIONS !== 'false'
	}

	public async checkHealth(): Promise<PermissionHealthCheckItem> {
		const contracts = this.importContracts()

		const auth = AuthService.Auth(this.skill.rootDir)
		const skill = auth.getCurrentSkill()

		return {
			status: 'passed',
			permissionContracts: contracts.map((c) => ({
				contractId: buildPermissionContractId(c.id, skill?.slug),
				permissionIds: c.permissions.map((p) => p.id),
			})),
		}
	}
	private importContracts(): PermissionContract[] {
		const path = permissionDiskUtil.resolveCombinedPermissionPath(
			diskUtil.resolveBuiltHashSprucePath(this.skill.activeDir)
		)

		let contracts: PermissionContract[] = []
		if (diskUtil.doesFileExist(path)) {
			contracts = require(path).default
		}
		return contracts
	}

	public async isInstalled(): Promise<boolean> {
		const settings = new SettingsService(this.skill.rootDir)
		return settings.isMarkedAsInstalled('permission')
	}
	public async destroy(): Promise<void> {}
	public isBooted(): boolean {
		return false
	}
	public onBoot(cb: BootCallback): void {
		this.bootHandler = cb
	}
}

export default (skill: Skill) => {
	const feature = new PermissionFeature(skill)
	skill.registerFeature('permission', feature)
}
