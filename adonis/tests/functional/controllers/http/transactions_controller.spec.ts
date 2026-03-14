import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { RoleEnum } from '#enums/auth/role.enum'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import { UserFactory } from '#database/factories/user_factory'
import { ClientFactory } from '#database/factories/client_factory'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { ProductFactory } from '#database/factories/product_factory'
import { TransactionFactory } from '#database/factories/transaction_factory'
import { TransactionProductFactory } from '#database/factories/transaction_product_factory'

const TRANSACTIONS_BASE_URL = '/api/v1/transactions'

async function runAceCommand(commandName: string, args: string[]) {
  const ace = await app.container.make('ace')
  const command = await ace.exec(commandName, args)

  if (!command.exitCode) {
    return
  }

  if (command.error) {
    throw command.error
  }

  throw new Error(
    `Could not run "${commandName}". Check database connectivity and migration configuration.`
  )
}

async function cleanupTransactions() {
  await db.from('transaction_products').delete()
  await db.from('transactions').delete()
  await db.from('products').delete()
  await db.from('gateways').delete()
  await db.from('clients').delete()
  await db.from('auth_access_tokens').delete()
  await db.from('users').delete()
}

test.group('TransactionsController | functional', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupTransactions()
  })

  group.each.timeout(10000)

  test('lists only transaction data', async ({ client }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    const transaction = await TransactionFactory.merge({
      status: TransactionStatusEnum.AUTHORIZED,
    }).create()

    // when
    const response = await client.get(TRANSACTIONS_BASE_URL).loginAs(finance)

    // then
    response.assertStatus(200)
    response.assertBody({
      data: [
        {
          id: transaction.id,
          clientId: transaction.clientId,
          gatewayId: transaction.gatewayId,
          externalId: transaction.externalId,
          status: TransactionStatusEnum.AUTHORIZED,
          amount: transaction.amount / 100,
          cardLastNumbers: transaction.cardLastNumbers,
        },
      ],
    })
  })

  test('shows a transaction with all related data', async ({ client }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    const clientRecord = await ClientFactory.create()
    const gateway = await GatewayFactory.merge({ isActive: true, priority: 1 }).create()
    const firstProduct = await ProductFactory.merge({ quantity: 10 }).create()
    const secondProduct = await ProductFactory.merge({ quantity: 5 }).create()
    const transaction = await TransactionFactory.merge({
      clientId: clientRecord.id,
      gatewayId: gateway.id,
      externalId: 'tx-show-1',
      status: TransactionStatusEnum.AUTHORIZED,
      amount: 2000,
      cardLastNumbers: '6063',
    }).create()

    await TransactionProductFactory.merge({
      transactionId: transaction.id,
      productId: firstProduct.id,
      quantity: 1,
    }).create()

    await TransactionProductFactory.merge({
      transactionId: transaction.id,
      productId: secondProduct.id,
      quantity: 2,
    }).create()

    // when
    const response = await client.get(`${TRANSACTIONS_BASE_URL}/${transaction.id}`).loginAs(finance)

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: transaction.id,
        externalId: 'tx-show-1',
        status: TransactionStatusEnum.AUTHORIZED,
        amount: 20,
        cardLastNumbers: '6063',
        client: {
          id: clientRecord.id,
          userId: clientRecord.userId,
          name: clientRecord.name,
          email: clientRecord.email,
        },
        gateway: {
          id: gateway.id,
          name: gateway.name,
          isActive: gateway.isActive,
          priority: gateway.priority,
        },
        items: [
          {
            product: {
              id: firstProduct.id,
              name: firstProduct.name,
              quantity: firstProduct.quantity,
            },
            quantity: 1,
          },
          {
            product: {
              id: secondProduct.id,
              name: secondProduct.name,
              quantity: secondProduct.quantity,
            },
            quantity: 2,
          },
        ],
      },
    })
  })
})
