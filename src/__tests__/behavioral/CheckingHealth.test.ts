import { PkgService, Skill } from '@sprucelabs/spruce-skill-utils'
import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import plugin from '../../permission.plugin'
import {
    PermissionHealthCheckItem,
    PermissionHealthContract,
} from '../../permission.types'
import AbstractPermissionTest from '../support/AbstractPermissionTest'
import { generateHealthContractValues } from '../support/generateContractValues'

@fake.login()
export default class CheckingHealthTest extends AbstractPermissionTest {
    private static skill: Skill
    private static namespace: string

    protected static async beforeEach() {
        await super.beforeEach()
        //@ts-ignore
        delete this.skill
        //@ts-ignore
        delete this.namespace
    }

    @test()
    protected static async canCreateCheckingHealth() {
        assert.isFunction(plugin)
    }

    @test()
    protected static async isNotInHealthCheckIfNotInstalled() {
        const health = await this.checkHealthForSkillAt('not-installed-skill')
        assert.isFalsy(health.permission)
    }

    @test()
    protected static async isInHealthCheckIfInstalled() {
        const health = await this.checkHealthForSkillAt('installed-skill')
        assert.isEqualDeep(health.permission, {
            status: 'passed',
            permissionContracts: [],
        })
    }

    @test()
    protected static async pullsPermsFromCombinedFile() {
        await this.setupSkillAndSetNamespace()

        const contract = this.generateContractValues()

        await this.saveContracts([contract])

        await this.assertHealthEquals({
            status: 'passed',
            permissionContracts: [
                this.generateHealthContractValues(contract.id, []),
            ],
        })
    }

    @test()
    protected static async pullsContractwithPermIds() {
        await this.setupSkillAndSetNamespace()

        const contract1 = this.generateContractValues(['hey', 'there'])
        const contract2 = this.generateContractValues(['what', 'the'])

        await this.saveContracts([contract1, contract2])

        await this.assertHealthEquals({
            status: 'passed',
            permissionContracts: [
                this.generateHealthContractValues(contract1.id, [
                    'hey',
                    'there',
                ]),
                this.generateHealthContractValues(contract2.id, [
                    'what',
                    'the',
                ]),
            ],
        })
    }

    private static generateHealthContractValues(
        contractId: string,
        permissionIds: string[]
    ): PermissionHealthContract {
        return generateHealthContractValues(
            contractId,
            permissionIds,
            this.namespace
        )
    }

    private static async assertHealthEquals(
        expected: PermissionHealthCheckItem
    ) {
        const health = await this.checkHealth()
        assert.isEqualDeep(health.permission, expected)
    }

    private static async setupSkillAndSetNamespace() {
        await this.setupSkill('installed-skill')
        const namespace = generateId()
        this.setNamespace(namespace)
        return namespace
    }

    private static setNamespace(namespace: string) {
        const pkg = new PkgService(this.cwd)
        pkg.set({ path: 'skill.namespace', value: namespace })
        this.namespace = namespace
    }

    private static async checkHealthForSkillAt(testDir: string) {
        await this.setupSkill(testDir)
        const health = await this.checkHealth()
        return health
    }

    private static async setupSkill(testDir: string) {
        this.skill = await this.SkillFromTestDir(testDir)
    }

    private static async checkHealth() {
        return await this.skill.checkHealth()
    }
}
