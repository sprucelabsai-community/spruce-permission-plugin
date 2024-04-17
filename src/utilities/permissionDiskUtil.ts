import { diskUtil } from '@sprucelabs/spruce-skill-utils'

const permissionDiskUtil = {
    resolveCombinedPermissionPath(cwd: string) {
        try {
            const match = diskUtil.resolveFileInHashSpruceDir(
                cwd,
                'permissions',
                `permissions`
            )

            return match
        } catch {
            /* Empty */
        }

        return diskUtil.resolvePath(cwd, 'permissions', 'permissions')
    },
}

export default permissionDiskUtil
