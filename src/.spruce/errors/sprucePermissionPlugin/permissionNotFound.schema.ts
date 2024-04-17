import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const permissionNotFoundSchema: SpruceErrors.SprucePermissionPlugin.PermissionNotFoundSchema =
    {
        id: 'permissionNotFound',
        namespace: 'SprucePermissionPlugin',
        name: 'Permission not found',
        fields: {
            /** . */
            id: {
                type: 'id',
                isRequired: true,
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(permissionNotFoundSchema)

export default permissionNotFoundSchema
