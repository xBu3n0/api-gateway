import { GatewaySchema } from '#database/schema'
import Transaction from '#models/transactions/transaction'
import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Gateway extends GatewaySchema {
  @column({
    consume: (value) => value === true || value === 1,
  })
  declare isActive: boolean

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>
}
