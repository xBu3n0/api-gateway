import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import type { ChargeGatewayInput, GatewayChargeResult } from '#application/gateways/payment_gateway'
import type PaymentGateway from '#application/gateways/payment_gateway'
import GatewayProcessorRegistry from '#services/transactions/gateway_processor_registry'
import TransactionService from '#services/transactions/transaction.service'
import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import ProductRepositoryInterface from '#repositories/transactions/product.repository'
import GatewayRepositoryInterface from '#repositories/transactions/gateway.repository'
import ClientRepositoryInterface from '#repositories/transactions/client.repository'
import TransactionRepositoryInterface from '#repositories/transactions/transaction.repository'

export async function runAceCommand(commandName: string, args: string[]) {
  const ace = await app.container.make('ace')
  const command = await ace.exec(commandName, args)

  if (!command.exitCode) {
    return
  }

  if (command.error) {
    throw command.error
  }

  throw new Error(`Could not run "${commandName}".`)
}

export async function cleanupTransactionsDatabase() {
  await db.from('transaction_products').delete()
  await db.from('transactions').delete()
  await db.from('products').delete()
  await db.from('gateways').delete()
  await db.from('clients').delete()
  await db.from('auth_access_tokens').delete()
  await db.from('users').delete()
}

export async function makeTransactionService(processors: FakeGatewayProcessor[]) {
  const transactionRepository = await app.container.make(TransactionRepositoryInterface)
  const productRepository = await app.container.make(ProductRepositoryInterface)
  const clientRepository = await app.container.make(ClientRepositoryInterface)
  const gatewayRepository = await app.container.make(GatewayRepositoryInterface)

  return new TransactionService(
    transactionRepository,
    productRepository,
    clientRepository,
    gatewayRepository,
    new GatewayProcessorRegistry(processors)
  )
}

export class FakeGatewayProcessor implements PaymentGateway {
  readonly provider: string
  readonly chargeCalls: ChargeGatewayInput[] = []
  readonly refundCalls: string[] = []

  constructor(
    provider: string,
    private readonly result: GatewayChargeResult | Error
  ) {
    this.provider = provider
  }

  async setup() {}

  matchesGatewayProvider(gateway: GatewayEntity) {
    return gateway.provider === this.provider
  }

  async charge(input: ChargeGatewayInput) {
    this.chargeCalls.push(input)

    if (this.result instanceof Error) {
      throw this.result
    }

    return this.result
  }

  async refund(externalId: string) {
    this.refundCalls.push(externalId)
  }
}
