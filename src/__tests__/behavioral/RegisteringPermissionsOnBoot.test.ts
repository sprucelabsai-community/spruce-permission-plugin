import { EventFeature } from '@sprucelabs/spruce-event-plugin'
import { Skill } from '@sprucelabs/spruce-skill-utils'
import { eventFaker, fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test-utils'
import permissionPlugin from '../../permission.plugin'
import { Resolve } from '../../permission.types'
import AbstractPermissionTest from '../support/AbstractPermissionTest'
import { SyncPermissionsTargetAndPayload } from '../support/EventFaker'

@fake.login()
export default class RegisteringPermissionsOnBootTest extends AbstractPermissionTest {
    private static skill: Skill

    protected static async beforeEach() {
        await super.beforeEach()
        this.skill = await this.SkillFromTestDir('installed-skill')
        process.env.SHOULD_REGISTER_PERMISSIONS = 'true'
        SpyEventFeature.wasAddPreReqInvoked = false
        SpyEventFeature.wasRegisterEventsInvoked = false
    }

    @test()
    protected static async canCreateRegisteringPermissionsOnBoot() {
        await this.assertAttemptedRegistration(true)
    }

    @test()
    protected static async registersPermissionsFromCombinedFile() {
        const contract = this.generateContractValues(['hey', 'there'])
        await this.saveContracts([contract])

        let passedPayload:
            | SyncPermissionsTargetAndPayload['payload']
            | undefined

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

    @test()
    protected static async addsPreReqToEventsPluginToWaitUntilAfterRegisteringPermissions() {
        this.enableEventRegistration()

        let resolve: Resolve = () => {}

        await this.eventFaker.fakeRegisterPermissionContracts(async () => {
            await new Promise((r) => {
                resolve = r as Resolve
            })
        })

        const { promise } = await this.bootWithSpyEventPlugin()

        await this.wait(100)
        assert.isFalse(SpyEventFeature.wasRegisterEventsInvoked)
        resolve()
        await this.wait(100)
        assert.isTrue(SpyEventFeature.wasRegisterEventsInvoked)

        await promise
    }

    @test()
    protected static async shouldNotAddPreReqIfNotRegisteringPermissions() {
        process.env.SHOULD_REGISTER_PERMISSIONS = 'false'
        const { promise } = await this.bootWithSpyEventPlugin()
        assert.isFalse(SpyEventFeature.wasAddPreReqInvoked)
        await promise
    }

    @test()
    protected static async shouldResolvePreReqOnError() {
        await eventFaker.makeEventThrow(
            'sync-permission-contracts::v2020_12_25'
        )
        try {
            const { promise } = await this.bootWithSpyEventPlugin()
            await promise
        } catch {
            /* empty */
        }
        assert.isTrue(SpyEventFeature.wasRegisterEventsInvoked)
    }

    private static enableEventRegistration() {
        process.env.SHOULD_REGISTER_EVENTS_AND_LISTENERS = 'true'
        process.env.SHOULD_CACHE_EVENT_REGISTRATIONS = 'false'
    }

    private static async bootWithSpyEventPlugin() {
        const skill = await this.Skill({
            plugins: [permissionPlugin, eventPlugin],
        })

        const promise = this.bootSkill({ skill })
        return { promise }
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

//@ts-ignore remove this when you see it (upgrade should have set methods to protected)
class SpyEventFeature extends EventFeature {
    public static wasRegisterEventsInvoked = false
    public static wasAddPreReqInvoked = false

    public async reRegisterEvents() {
        SpyEventFeature.wasRegisterEventsInvoked = true
    }

    public addPreReq(req: Promise<unknown>): void {
        SpyEventFeature.wasAddPreReqInvoked = true
        return super.addPreReq(req)
    }
}

const eventPlugin = (skill: Skill) => {
    const feature = new SpyEventFeature(skill)
    skill.registerFeature('event', feature)
}
