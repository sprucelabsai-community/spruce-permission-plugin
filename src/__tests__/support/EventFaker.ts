import { eventFaker, SpruceSchemas } from '@sprucelabs/spruce-test-fixtures'
import { generateId } from '@sprucelabs/test-utils'
import generateContractValues from './generateContractValues.1'

export default class EventFaker {
    private getResolvedContractResponse?: ResolvedContract

    public async fakeRegisterPermissionContracts(
        cb?: (
            targetAndPayload: SyncPermissionsTargetAndPayload
        ) => void | Promise<void>
    ) {
        await eventFaker.on(
            'sync-permission-contracts::v2020_12_25',
            async (targetAndPayload) => {
                await cb?.(targetAndPayload)

                return {
                    contractRecords: [
                        {
                            id: generateId(),
                            contract: generateContractValues([]),
                        },
                    ],
                }
            }
        )
    }

    public async fakeGetResolvedPermissionsContract(
        cb?: (targetAndPayload: GetResolvedContractTargetAndPayload) => void
    ) {
        await eventFaker.on(
            'get-resolved-permissions-contract::v2020_12_25',
            async (targetAndPayload) => {
                cb?.(targetAndPayload)
                return {
                    resolvedContract: this.getResolvedContractResponse ?? {
                        contractId: generateId(),
                        permissions: [],
                    },
                }
            }
        )
    }

    public setGetResolvedContractResponse(contract: ResolvedContract) {
        this.getResolvedContractResponse = contract
    }
}

export type SyncPermissionsTargetAndPayload =
    SpruceSchemas.Mercury.v2020_12_25.SyncPermissionContractsEmitTargetAndPayload

type GetResolvedContractTargetAndPayload =
    SpruceSchemas.Mercury.v2020_12_25.GetResolvedPermissionsContractEmitTargetAndPayload

export type ResolvedContract =
    SpruceSchemas.Mercury.v2020_12_25.ResolvedContract
