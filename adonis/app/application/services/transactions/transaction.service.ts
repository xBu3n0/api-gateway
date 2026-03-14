import { inject } from '@adonisjs/core'
import type { ListTransactionsFilters } from '#repositories/transactions/transaction.repository'
import ClientRepositoryInterface from '#repositories/transactions/client.repository'
import GatewayRepositoryInterface from '#repositories/transactions/gateway.repository'
import ProductRepositoryInterface from '#repositories/transactions/product.repository'
import TransactionRepositoryInterface from '#repositories/transactions/transaction.repository'
import GatewayProcessorRegistry from '#services/transactions/gateway_processor_registry'
import NewClientEntity from '#domain/entities/transactions/new_client.entity'
import NewTransactionEntity from '#domain/entities/transactions/new_transaction.entity'
import TransactionRefundNotAllowedException from '#domain/exceptions/transactions/transaction_refund_not_allowed.exception'
import NoActiveGatewayException from '#domain/exceptions/transactions/no_active_gateway.exception'
import ProductNotFoundException from '#domain/exceptions/transactions/product_not_found.exception'
import TransactionNotFoundException from '#domain/exceptions/transactions/transaction_not_found.exception'
import TransactionPaymentFailedException from '#domain/exceptions/transactions/transaction_payment_failed.exception'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import { Email } from '#domain/primitives/shared/email.primitive'
import { UserId } from '#domain/primitives/auth/user_id.primitive'
import { CardLastNumbers } from '#domain/primitives/transactions/card_last_numbers.primitive'
import { CardNumber } from '#domain/primitives/transactions/card_number.primitive'
import { ClientName } from '#domain/primitives/transactions/client_name.primitive'
import { Cvv } from '#domain/primitives/transactions/cvv.primitive'
import { ExternalTransactionId } from '#domain/primitives/transactions/external_transaction_id.primitive'
import { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import { ProductPrice } from '#domain/primitives/transactions/product_price.primitive'
import { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import { TransactionId } from '#domain/primitives/transactions/transaction_id.primitive'
import { TransactionStatus } from '#domain/primitives/transactions/transaction_status.primitive'

export interface PurchaseInput {
  userId: number
  name: string
  email: string
  cardNumber: string
  cvv: string
  items: Array<{
    productId: number
    quantity: number
    price: string
  }>
}

export interface TransactionFiltersInput {
  status?: TransactionStatusEnum
  clientId?: number
  gatewayId?: number
}

interface NormalizedPurchaseItem {
  productId: ProductId
  quantity: ProductQuantity
  amount: ProductPrice
}

interface PurchaseContext {
  userId: UserId
  email: Email
  clientName: ClientName
  cardNumber: CardNumber
  cvv: Cvv
  items: NormalizedPurchaseItem[]
  totalAmount: ProductPrice
}

interface GatewayAuthorizationResult {
  gatewayId: GatewayId
  externalTransactionId: ExternalTransactionId
}

@inject()
export default class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepositoryInterface,
    private readonly productRepository: ProductRepositoryInterface,
    private readonly clientRepository: ClientRepositoryInterface,
    private readonly gatewayRepository: GatewayRepositoryInterface,
    private readonly gatewayProcessorRegistry: GatewayProcessorRegistry
  ) {}

  async purchase(input: PurchaseInput) {
    const context = await this.buildPurchaseContext(input)
    const gateways = await this.listActiveGatewaysOrFail()
    const authorization = await this.authorizePurchase(gateways, context)
    const client = await this.findOrCreateClient(context.userId, context.clientName, context.email)
    const authorized = await this.transactionRepository.createDraftWithItems({
      transaction: NewTransactionEntity.create(
        client.id,
        authorization.gatewayId,
        authorization.externalTransactionId,
        context.totalAmount,
        CardLastNumbers.create(context.cardNumber.lastFourDigits()),
        TransactionStatus.authorized()
      ),
      items: context.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })

    return this.getById(authorized.id.value)
  }

  async listTransactions(filters: TransactionFiltersInput = {}) {
    return this.transactionRepository.list(this.resolveFilters(filters))
  }

  async getById(id: number) {
    const transactionId = TransactionId.create(id)
    const transaction = await this.transactionRepository.findDetailedById(transactionId)

    if (!transaction) {
      throw new TransactionNotFoundException(`Transaction '${transactionId.value}' was not found.`)
    }

    return transaction
  }

  async refund(id: number) {
    const transactionId = TransactionId.create(id)
    const transaction = await this.transactionRepository.findById(transactionId)

    if (!transaction) {
      throw new TransactionNotFoundException(`Transaction '${transactionId.value}' was not found.`)
    }

    if (!transaction.status.is(TransactionStatusEnum.AUTHORIZED)) {
      throw new TransactionRefundNotAllowedException(
        `Transaction '${transactionId.value}' cannot be refunded from status '${transaction.status.value}'.`
      )
    }

    const gateway = await this.gatewayRepository.findById(transaction.gatewayId)
    if (!gateway) {
      throw new NoActiveGatewayException(
        `Gateway '${transaction.gatewayId.value}' was not found for refund processing.`
      )
    }

    const processor = this.gatewayProcessorRegistry.getFor(gateway)
    await processor.setup()
    await processor.refund(transaction.externalId.value)
    await this.transactionRepository.update(transaction.refund())

    return this.getById(transactionId.value)
  }

  private async normalizeItems(input: PurchaseInput['items']) {
    const items = input.map((item) => ({
      productId: ProductId.create(item.productId),
      quantity: ProductQuantity.create(item.quantity),
      amount: ProductPrice.create(item.price),
    }))

    const products = await this.productRepository.findByIds(items.map((item) => item.productId))
    const productsById = new Set(products.map((product) => product.id.value))

    return items.map((item) => {
      if (!productsById.has(item.productId.value)) {
        throw new ProductNotFoundException(`Product '${item.productId.value}' was not found.`)
      }

      return item
    })
  }

  private resolveFilters(filters: TransactionFiltersInput) {
    const resolvedFilters: ListTransactionsFilters = {}

    if (filters.status) {
      resolvedFilters.status = TransactionStatus.create(filters.status)
    }

    if (filters.clientId !== undefined) {
      resolvedFilters.clientId = ClientId.create(filters.clientId)
    }

    if (filters.gatewayId !== undefined) {
      resolvedFilters.gatewayId = GatewayId.create(filters.gatewayId)
    }

    return resolvedFilters
  }

  private async buildPurchaseContext(input: PurchaseInput): Promise<PurchaseContext> {
    const userId = UserId.create(input.userId)
    const email = Email.create(input.email)
    const clientName = ClientName.create(input.name)
    const cardNumber = CardNumber.create(input.cardNumber)
    const cvv = Cvv.create(input.cvv)
    const items = await this.normalizeItems(input.items)

    return {
      userId,
      email,
      clientName,
      cardNumber,
      cvv,
      items,
      totalAmount: this.calculateTotalAmount(items),
    }
  }

  private calculateTotalAmount(items: NormalizedPurchaseItem[]) {
    let totalAmount = ProductPrice.create('0')

    for (const item of items) {
      totalAmount = totalAmount.sum(item.amount.multiply(item.quantity.value))
    }

    return totalAmount
  }

  private async findOrCreateClient(userId: UserId, clientName: ClientName, email: Email) {
    return (
      (await this.clientRepository.findByEmail(email)) ??
      this.clientRepository.create(NewClientEntity.create(userId, clientName, email))
    )
  }

  private async listActiveGatewaysOrFail() {
    const gateways = await this.gatewayRepository.listActiveByPriority()

    if (gateways.length === 0) {
      throw new NoActiveGatewayException('No active gateway is available to process the purchase.')
    }

    return gateways
  }

  private async authorizePurchase(
    gateways: Awaited<ReturnType<GatewayRepositoryInterface['listActiveByPriority']>>,
    context: PurchaseContext
  ): Promise<GatewayAuthorizationResult> {
    for (const gateway of gateways) {
      try {
        const processor = this.gatewayProcessorRegistry.getFor(gateway)
        await processor.setup()
        const result = await processor.charge({
          amount: Number(context.totalAmount.value),
          name: context.clientName.value,
          email: context.email.value,
          cardNumber: context.cardNumber.value,
          cvv: context.cvv.value,
        })

        return {
          gatewayId: gateway.id,
          externalTransactionId: ExternalTransactionId.create(result.externalId),
        }
      } catch {
        continue
      }
    }

    throw new TransactionPaymentFailedException(
      'The purchase could not be authorized by any active gateway.'
    )
  }
}
