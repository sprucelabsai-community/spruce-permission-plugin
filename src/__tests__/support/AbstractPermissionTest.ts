import { PermissionContract } from '@sprucelabs/mercury-types'
import { plugin as events } from '@sprucelabs/spruce-event-plugin'
import { SkillFactoryOptions } from '@sprucelabs/spruce-skill-booter'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { AbstractSpruceFixtureTest } from '@sprucelabs/spruce-test-fixtures'
import plugin from '../../permission.plugin'
import permissionDiskUtil from '../../utilities/permissionDiskUtil'
import EventFaker from './EventFaker'
import generateContractValues from './generateContractValues.1'
import { renderPermissionTemplate } from './renderPermissionTemplate'

process.env.SHOULD_REGISTER_EVENTS_AND_LISTENERS = 'false'

export default abstract class AbstractPermissionTest extends AbstractSpruceFixtureTest {
    protected static eventFaker: EventFaker

    protected static async beforeEach() {
        await super.beforeEach()
        this.eventFaker = new EventFaker()
    }

    protected static async Skill(options?: SkillFactoryOptions) {
        const { plugins = [events, plugin] } = options ?? {}

        return super.Skill({
            plugins,
            ...options,
        })
    }

    protected static generateContractValues(permissions: string[] = []) {
        const contract: PermissionContract = generateContractValues(permissions)
        return contract
    }

    protected static async saveContracts(contracts: PermissionContract[]) {
        const perm = renderPermissionTemplate(contracts)

        const dest =
            permissionDiskUtil.resolveCombinedPermissionPath(
                diskUtil.resolveBuiltHashSprucePath(this.cwd)
            ) + '.js'

        diskUtil.writeFile(dest, perm)

        //testing for circle
        await this.wait(10)
    }
}
