import { Exception } from '@adonisjs/core/exceptions'

export default class GatewayNotFoundException extends Exception {
  static status = 404
}
