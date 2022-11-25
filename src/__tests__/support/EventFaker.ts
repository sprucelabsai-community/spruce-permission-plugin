import { eventFaker, SpruceSchemas } from '@sprucelabs/spruce-test-fixtures'
import { generateId } from '@sprucelabs/test-utils'
import generateContractValues from './generateContractValues.1'

export default class EventFaker {
	public async fakeRegisterPermissionContracts(
		cb?: (targetAndPayload: SyncPermissionsTargetAndPayload) => void
	) {
		await eventFaker.on(
			'sync-permission-contracts::v2020_12_25',
			(targetAndPayload) => {
				cb?.(targetAndPayload)

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
}

export type SyncPermissionsTargetAndPayload =
	SpruceSchemas.Mercury.v2020_12_25.SyncPermissionContractsEmitTargetAndPayload
