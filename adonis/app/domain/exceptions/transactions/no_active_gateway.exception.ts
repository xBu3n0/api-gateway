import { Exception } from '@adonisjs/core/exceptions'

export default class NoActiveGatewayException extends Exception {
  static status = 422
}
