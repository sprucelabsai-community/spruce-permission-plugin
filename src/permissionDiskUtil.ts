import { diskUtil } from '@sprucelabs/spruce-skill-utils'

const permissionDiskUtil = {
	resolveCombinedPermissionPath(hashSpruceDir: string, ext = 'js') {
		return diskUtil.resolvePath(
			hashSpruceDir,
			'permissions',
			`permissions.${ext}`
		)
	},
}

export default permissionDiskUtil
