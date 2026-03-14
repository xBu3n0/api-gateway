import type { TransactionDetails } from '#repositories/transactions/transaction.repository'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TransactionTransformer extends BaseTransformer<TransactionDetails> {
  toObject() {
    const { transaction, client, gateway, items } = this.resource

    return {
      id: transaction.id.value,
      externalId: transaction.externalId.value,
      status: transaction.status.value,
      amount: transaction.amount.value,
      cardLastNumbers: transaction.cardLastNumbers.value,
      client: {
        id: client.id.value,
        userId: client.userId.value,
        name: client.name.value,
        email: client.email.value,
      },
      gateway: {
        id: gateway.id.value,
        name: gateway.name.value,
        isActive: gateway.status.value,
        priority: gateway.priority.value,
      },
      items: items.map((item) => ({
        product: {
          id: item.product.id.value,
          name: item.product.name.value,
          amount: item.product.amount.value,
        },
        quantity: item.quantity.value,
        subtotal: item.subtotal.value,
      })),
    }
  }
}
