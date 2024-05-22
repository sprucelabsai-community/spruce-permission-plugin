import { PermissionContract } from '@sprucelabs/mercury-types'
import { EventFeature } from '@sprucelabs/spruce-event-plugin'
import {
    AuthorizerFactory,
    buildPermissionContractId,
} from '@sprucelabs/spruce-permission-utils'
import {
    AuthService,
    BootCallback,
    diskUtil,
    Log,
    SettingsService,
    Skill,
    SkillFeature,
} from '@sprucelabs/spruce-skill-utils'
import { PermissionHealthCheckItem, Resolve } from './permission.types'
import permissionDiskUtil from './utilities/permissionDiskUtil'

export class PermissionFeature implements SkillFeature {
    private skill: Skill
    private bootHandler?: BootCallback
    private log: Log
    private resolvePreReq?: Resolve = () => {}

    public constructor(skill: Skill) {
        this.skill = skill
        this.log = skill.buildLog('Permission.Feature')
    }

    public async execute(): Promise<void> {
        const events = this.skill.getFeatureByCode('event') as EventFeature
        AuthorizerFactory.setConnectToApi(() => events.connectToApi())
        this.setupContext()

        if (this.shouldRegisterPermissions()) {
            events.addPreReq(
                new Promise((r) => {
                    this.resolvePreReq = r as Resolve
                })
            )

            const client = await events.connectToApi()
            const contracts = this.importContracts()

            this.log.info(
                `Syncing ${contracts.length} permission contract${
                    contracts.length === 1 ? '' : 's'
                }`
            )

            try {
                await client.emitAndFlattenResponses(
                    'sync-permission-contracts::v2020_12_25',
                    {
                        payload: {
                            contracts,
                        },
                    }
                )

                this.log.info(`Done syncing permission contracts`)
            } finally {
                this.resolvePreReq?.()
            }
        }

        await this.bootHandler?.()
    }

    private setupContext() {
        const authorizer = AuthorizerFactory.getInstance()
        this.skill.updateContext('authorizer', authorizer)
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
            this.skill.rootDir
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
        this.resolvePreReq?.()
    }

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
