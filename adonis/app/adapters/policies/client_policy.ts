import { RoleEnum } from '#enums/auth/role.enum'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import type User from '#models/auth/user'

export default class ClientPolicy extends BasePolicy {
  before(user: User) {
    if (user.role === RoleEnum.ADMIN) {
      return true
    }
  }

  readAll(_user: User): AuthorizerResponse {
    return true
  }

  read(_user: User): AuthorizerResponse {
    return true
  }
}
