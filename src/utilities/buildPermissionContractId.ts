/**
 * @deprecated delete reference and re-import from `permission-utils`
 */
export default function buildPermissionContractId(
    contractId: string,
    namespace?: string
): string {
    return `${namespace}.${contractId}`
}
