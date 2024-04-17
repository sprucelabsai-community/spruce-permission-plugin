import { PermissionContract } from '@sprucelabs/mercury-types'
import { generateId } from '@sprucelabs/test-utils'

export default function generateContractValues(permissions: string[]) {
    const contract: PermissionContract = {
        id: generateId(),
        name: generateId(),
        permissions: permissions.map((id) => ({
            id,
            name: generateId(),
            defaults: {},
        })),
    }
    return contract
}
