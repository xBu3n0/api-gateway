import { Exception } from '@adonisjs/core/exceptions'

export default class GatewayProcessorNotConfiguredException extends Exception {
  static status = 500
}
