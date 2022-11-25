import { PermissionContract } from '@sprucelabs/mercury-types'
import {
	AuthService,
	BootCallback,
	diskUtil,
	SettingsService,
	Skill,
	SkillFeature,
} from '@sprucelabs/spruce-skill-utils'
import buildPermissionContractId from './buildPermissionContractId'
import { PermissionHealthCheckItem } from './permission.types'
import permissionDiskUtil from './permissionDiskUtil'

export class PermissionFeature implements SkillFeature {
	private skill: Skill
	public constructor(skill: Skill) {
		this.skill = skill
	}

	public async execute(): Promise<void> {
		throw new Error('Method not implemented.')
	}

	public async checkHealth(): Promise<PermissionHealthCheckItem> {
		let contracts = this.importContracts()

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
	public async destroy(): Promise<void> {
		throw new Error('Method not implemented.')
	}
	public isBooted(): boolean {
		throw new Error('Method not implemented.')
	}
	public onBoot(cb: BootCallback): void {}
}

export default (skill: Skill) => {
	const feature = new PermissionFeature(skill)
	skill.registerFeature('permission', feature)
}
