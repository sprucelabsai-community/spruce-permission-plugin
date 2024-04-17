import { PermissionHealthContract } from '../../permission.types'
import buildPermissionContractId from '../../utilities/buildPermissionContractId'

export function generateHealthContractValues(
    contractId: string,
    permissionIds: string[],
    namespace?: string
): PermissionHealthContract {
    return {
        contractId: buildPermissionContractId(contractId, namespace),
        permissionIds,
    }
}
