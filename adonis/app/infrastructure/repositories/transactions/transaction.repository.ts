import type {
  CreateTransactionDraftPayload,
  ListTransactionsFilters,
  TransactionDetails,
} from '#repositories/transactions/transaction.repository'
import type TransactionRepositoryInterface from '#repositories/transactions/transaction.repository'
import ClientEntity from '#domain/entities/shared/client.entity'
import GatewayEntity from '#domain/entities/shared/gateway.entity'
import ProductEntity from '#domain/entities/shared/product.entity'
import TransactionEntity from '#domain/entities/shared/transaction.entity'
import type { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'
import type { TransactionId } from '#domain/primitives/transactions/transaction_id.primitive'
import db from '@adonisjs/lucid/services/db'
import type Client from '#models/transactions/client'
import type Gateway from '#models/transactions/gateway'
import type Product from '#models/transactions/product'
import Transaction from '#models/transactions/transaction'
import TransactionProduct from '#models/transactions/transaction_product'

export default class LucidTransactionRepository implements TransactionRepositoryInterface {
  async createDraftWithItems(payload: CreateTransactionDraftPayload) {
    const created = await db.transaction(async (trx) => {
      const transaction = await Transaction.create(
        {
          clientId: payload.transaction.clientId.value,
          gatewayId: payload.transaction.gatewayId.value,
          externalId: payload.transaction.externalId.value,
          status: payload.transaction.status.value,
          amount: Number(payload.transaction.amount.value),
          cardLastNumbers: payload.transaction.cardLastNumbers.value,
        },
        { client: trx }
      )

      await TransactionProduct.createMany(
        payload.items.map((item) => ({
          transactionId: transaction.id,
          productId: item.productId.value,
          quantity: item.quantity.value,
        })),
        { client: trx }
      )

      return transaction
    })

    return this.toEntity(created)
  }

  async update(entity: TransactionEntity) {
    const transaction = await Transaction.findOrFail(entity.id.value)

    transaction.clientId = entity.clientId.value
    transaction.gatewayId = entity.gatewayId.value
    transaction.externalId = entity.externalId.value
    transaction.status = entity.status.value
    transaction.amount = Number(entity.amount.value)
    transaction.cardLastNumbers = entity.cardLastNumbers.value

    await transaction.save()

    return this.toEntity(transaction)
  }

  async findById(id: TransactionId) {
    const transaction = await Transaction.find(id.value)

    return transaction ? this.toEntity(transaction) : null
  }

  async list(filters: ListTransactionsFilters = {}) {
    const query = this.applyFilters(Transaction.query(), filters).orderBy('id', 'desc')
    const transactions = await query

    return transactions.map((transaction) => this.toEntity(transaction))
  }

  async findDetailedById(id: TransactionId) {
    const transaction = await Transaction.query()
      .where('id', id.value)
      .preload('client')
      .preload('gateway')
      .preload('products')
      .first()

    if (!transaction) {
      return null
    }

    return this.toDetails(transaction)
  }

  async listDetailed(filters: ListTransactionsFilters = {}) {
    const query = this.applyFilters(
      Transaction.query().preload('client').preload('gateway').preload('products'),
      filters
    ).orderBy('id', 'desc')
    const transactions = await query

    return transactions.map((transaction) => this.toDetails(transaction))
  }

  async listDetailedByClientId(clientId: ClientId) {
    const transactions = await Transaction.query()
      .where('client_id', clientId.value)
      .preload('client')
      .preload('gateway')
      .preload('products')
      .orderBy('id', 'desc')

    return transactions.map((transaction) => this.toDetails(transaction))
  }

  private toDetails(transaction: Transaction): TransactionDetails {
    const clientModel = transaction.$preloaded.client as Client
    const gatewayModel = transaction.$preloaded.gateway as Gateway
    const products = transaction.$preloaded.products as Product[]

    const client = ClientEntity.fromRecord({
      id: clientModel.id,
      userId: clientModel.userId,
      name: clientModel.name,
      email: clientModel.email,
    })

    const gateway = GatewayEntity.fromRecord({
      id: gatewayModel.id,
      provider: gatewayModel.provider,
      name: gatewayModel.name,
      isActive: gatewayModel.isActive,
      priority: gatewayModel.priority,
    })

    const entity = this.toEntity(transaction)

    const items = products.map((product) => {
      const productEntity = ProductEntity.fromRecord({
        id: product.id,
        name: product.name,
        amount: product.amount,
      })

      return {
        product: productEntity,
        quantity: ProductQuantity.create(Number(product.$extras.pivot_quantity)),
      }
    })

    return {
      transaction: entity,
      client,
      gateway,
      items,
    }
  }

  private toEntity(transaction: Transaction) {
    return TransactionEntity.fromRecord({
      id: transaction.id,
      clientId: transaction.clientId,
      gatewayId: transaction.gatewayId,
      externalId: transaction.externalId,
      status: transaction.status,
      amount: transaction.amount,
      cardLastNumbers: transaction.cardLastNumbers,
    })
  }

  private applyFilters<TQuery extends ReturnType<typeof Transaction.query>>(
    query: TQuery,
    filters: ListTransactionsFilters
  ) {
    if (filters.status) {
      query.where('status', filters.status.value)
    }

    if (filters.clientId) {
      query.where('client_id', filters.clientId.value)
    }

    if (filters.gatewayId) {
      query.where('gateway_id', filters.gatewayId.value)
    }

    return query
  }
}
