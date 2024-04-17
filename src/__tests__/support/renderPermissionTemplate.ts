import { PermissionContract } from '@sprucelabs/mercury-types'

export function renderPermissionTemplate(contracts: PermissionContract[]) {
    const permissionTemplate = `
exports.default = ${JSON.stringify(contracts, null, 2)}
`

    return permissionTemplate
}
