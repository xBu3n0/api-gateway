import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { UserRecord } from '#domain/entities/shared/user.entity'
import type { RoleEnum } from '#enums/auth/role.enum'
import Client from '#models/transactions/client'
import { afterSave, beforeDelete, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken
  declare skipClientSync?: boolean

  @hasOne(() => Client)
  declare client: HasOne<typeof Client>

  @afterSave()
  static async syncClient(user: User) {
    if (user.skipClientSync) {
      return
    }

    await Client.updateOrCreate(
      { userId: user.id },
      {
        userId: user.id,
        name: user.email,
        email: user.email,
      }
    )
  }

  @beforeDelete()
  static async deleteClient(user: User) {
    const client = await Client.findBy('userId', user.id)
    await client?.delete()
  }

  toRecord(): UserRecord {
    return {
      id: this.id,
      email: this.email,
      role: this.role as RoleEnum,
    }
  }
}
