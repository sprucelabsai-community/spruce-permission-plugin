import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'





export declare namespace SpruceErrors.SprucePermissionPlugin {

	
	export interface PermissionNotFound {
		
			
			'id': string
	}

	export interface PermissionNotFoundSchema extends SpruceSchema.Schema {
		id: 'permissionNotFound',
		namespace: 'SprucePermissionPlugin',
		name: 'Permission not found',
		    fields: {
		            /** . */
		            'id': {
		                type: 'id',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type PermissionNotFoundEntity = SchemaEntity<SpruceErrors.SprucePermissionPlugin.PermissionNotFoundSchema>

}




