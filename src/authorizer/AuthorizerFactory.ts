import { Authorizer } from '@sprucelabs/heartwood-view-controllers'
import { MercuryConnectFactory } from '@sprucelabs/mercury-client'
import { assertOptions } from '@sprucelabs/schema'
import AuthorizerImpl from './Authorizer'

export default class AuthorizerFactory {
	private static Class: AuthorizerContructor = AuthorizerImpl
	public static setClass(Class: AuthorizerContructor) {
		this.Class = Class
	}
	public static Authorizer(connectToApi: MercuryConnectFactory) {
		assertOptions({ connectToApi }, ['connectToApi'])
		return new this.Class(connectToApi)
	}
}

type AuthorizerContructor = new (options?: any) => Authorizer
