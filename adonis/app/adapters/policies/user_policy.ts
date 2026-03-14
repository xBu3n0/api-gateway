import type UserEntity from '#domain/entities/shared/user.entity'
import { RoleEnum } from '#enums/auth/role.enum'
import type User from '#models/auth/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  before(user: User) {
    if (user.role === RoleEnum.ADMIN) {
      return true
    }
  }

  create(user: User): AuthorizerResponse {
    return user.role === RoleEnum.MANAGER
  }

  readAll(user: User): AuthorizerResponse {
    return user.role === RoleEnum.MANAGER
  }

  read(user: User, _accessedUser: UserEntity): AuthorizerResponse {
    return user.role === RoleEnum.MANAGER
  }

  update(user: User, accessedUser: UserEntity): AuthorizerResponse {
    if (user.role !== RoleEnum.MANAGER) {
      return false
    }

    if (accessedUser.role.is(RoleEnum.ADMIN)) {
      return false
    }

    if (accessedUser.role.is(RoleEnum.MANAGER) && accessedUser.id.value !== user.id) {
      return false
    }

    return true
  }

  delete(user: User, accessedUser: UserEntity): AuthorizerResponse {
    if (user.role !== RoleEnum.MANAGER) {
      return false
    }

    if (accessedUser.role.is(RoleEnum.ADMIN)) {
      return false
    }

    if (accessedUser.role.is(RoleEnum.MANAGER) && accessedUser.id.value !== user.id) {
      return false
    }

    return true
  }
}
