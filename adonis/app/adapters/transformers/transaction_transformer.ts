import type TransactionEntity from '#domain/entities/shared/transaction.entity'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TransactionTransformer extends BaseTransformer<TransactionEntity> {
  toObject() {
    const { id, clientId, gatewayId, externalId, status, amount, cardLastNumbers } = this.resource

    return {
      id: id.value,
      clientId: clientId.value,
      gatewayId: gatewayId.value,
      externalId: externalId.value,
      status: status.value,
      amount: Number(amount.value),
      cardLastNumbers: cardLastNumbers.value,
    }
  }
}
