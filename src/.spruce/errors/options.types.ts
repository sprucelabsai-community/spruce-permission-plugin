import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface PermissionNotFoundErrorOptions extends SpruceErrors.SprucePermissionPlugin.PermissionNotFound, ISpruceErrorOptions {
	code: 'PERMISSION_NOT_FOUND'
}

type ErrorOptions =  | PermissionNotFoundErrorOptions 

export default ErrorOptions
