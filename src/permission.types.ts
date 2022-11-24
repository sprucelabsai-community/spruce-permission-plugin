import { HealthCheckItem } from '@sprucelabs/spruce-skill-utils'

declare module '@sprucelabs/spruce-skill-utils/build/types/skill.types' {
	interface HealthCheckResults {
		permission?: PermissionHealthCheckItem
	}
}

export interface PermissionHealthCheckItem extends HealthCheckItem {
	permissionContracts: PermissionHealthContract[]
}

export interface PermissionHealthContract {
	contractId: string
	permissionIds: string[]
}
