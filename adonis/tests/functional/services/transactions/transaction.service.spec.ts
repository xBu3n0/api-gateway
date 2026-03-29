import { test } from '@japa/runner'
import Client from '#models/transactions/client'
import Transaction from '#models/transactions/transaction'
import ProductNotFoundException from '#domain/exceptions/transactions/product_not_found.exception'
import TransactionPaymentFailedException from '#domain/exceptions/transactions/transaction_payment_failed.exception'
import TransactionNotFoundException from '#domain/exceptions/transactions/transaction_not_found.exception'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { ProductFactory } from '#database/factories/product_factory'
import {
  cleanupTransactionsDatabase,
  FakeGatewayProcessor,
  makeTransactionService,
  runAceCommand,
} from './test_utils.js'

test.group('TransactionService integration (real database)', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupTransactionsDatabase()
  })

  group.each.timeout(10000)

  test('authorizes a purchase on the first successful gateway', async ({ assert }) => {
    // given
    const firstProduct = await ProductFactory.merge({ amount: '10.00' }).create()
    const secondProduct = await ProductFactory.merge({ amount: '5.00' }).create()
    const gateway = await GatewayFactory.merge({
      provider: 'gateway_one',
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const processor = new FakeGatewayProcessor('gateway_one', { externalId: 'gw-1-tx' })
    const service = await makeTransactionService([processor])

    // when
    const purchase = await service.purchase({
      name: 'Jane Doe',
      email: 'jane@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [
        { productId: firstProduct.id, quantity: 2 },
        { productId: secondProduct.id, quantity: 1 },
      ],
    })

    // then
    assert.equal(processor.chargeCalls.length, 1)
    assert.equal(purchase.transaction.amount.value, 2500n)
    assert.equal(purchase.transaction.externalId.value, 'gw-1-tx')
    assert.equal(purchase.gateway.id.value, gateway.id)

    const persistedClient = await Client.findByOrFail('email', 'jane@example.com')
    const persistedTransaction = await Transaction.findOrFail(purchase.transaction.id.value)
    const persistedClients = await Client.query().where('email', 'jane@example.com')
    assert.equal(persistedClient.name, 'Jane Doe')
    assert.lengthOf(persistedClients, 1)
    assert.equal(persistedTransaction.gatewayId, gateway.id)
  })

  test('reuses the existing client found by email instead of creating another one', async ({
    assert,
  }) => {
    // given
    const originalClient = await Client.create({
      name: 'Original Name',
      email: 'same-client@example.com',
    })
    const product = await ProductFactory.merge({ amount: '10.00' }).create()
    await GatewayFactory.merge({
      provider: 'gateway_one',
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const service = await makeTransactionService([
      new FakeGatewayProcessor('gateway_one', { externalId: 'gw-existing-client' }),
    ])

    // when
    const purchase = await service.purchase({
      name: 'Different Name',
      email: 'same-client@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [{ productId: product.id, quantity: 1 }],
    })

    // then
    const persistedClients = await Client.query().where('email', 'same-client@example.com')

    assert.equal(purchase.client.id.value, originalClient.id)
    assert.equal(purchase.client.email.value, originalClient.email)
    assert.equal(purchase.client.name.value, originalClient.name)
    assert.lengthOf(persistedClients, 1)
  })

  test('falls back to the next active gateway when a gateway charge fails', async ({ assert }) => {
    // given
    const product = await ProductFactory.merge({ amount: '10.00' }).create()
    await GatewayFactory.merge({
      provider: 'gateway_one',
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const secondGateway = await GatewayFactory.merge({
      provider: 'gateway_two',
      name: 'Gateway 2',
      priority: 2,
      isActive: true,
    }).create()
    const failingGateway = new FakeGatewayProcessor('gateway_one', new Error('fail'))
    const successfulGateway = new FakeGatewayProcessor('gateway_two', { externalId: 'gw-2-tx' })
    const service = await makeTransactionService([failingGateway, successfulGateway])

    // when
    const purchase = await service.purchase({
      name: 'John Doe',
      email: 'john@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [{ productId: product.id, quantity: 1 }],
    })

    // then
    assert.equal(failingGateway.chargeCalls.length, 1)
    assert.equal(successfulGateway.chargeCalls.length, 1)
    assert.equal(purchase.gateway.id.value, secondGateway.id)
    assert.equal(purchase.transaction.externalId.value, 'gw-2-tx')
  })

  test('rejects a purchase when one of the requested products does not exist', async ({
    assert,
  }) => {
    // given
    const gateway = await GatewayFactory.merge({
      provider: 'gateway_one',
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const product = await ProductFactory.merge({ amount: '10.00' }).create()
    const processor = new FakeGatewayProcessor('gateway_one', { externalId: 'gw-1-tx' })
    const service = await makeTransactionService([processor])

    // when
    const purchaseWithMissingProduct = () =>
      service.purchase({
        name: 'Jane Missing Product',
        email: 'jane-missing@example.com',
        cardNumber: '5569000000006063',
        cvv: '010',
        items: [
          { productId: product.id, quantity: 1 },
          { productId: 999999, quantity: 1 },
        ],
      })

    // then
    await assert.rejects(purchaseWithMissingProduct, ProductNotFoundException)
    assert.equal(processor.chargeCalls.length, 0)

    const persistedTransaction = await Transaction.query().where('gateway_id', gateway.id)
    assert.lengthOf(persistedTransaction, 0)
  })

  test('refunds an authorized transaction using the stored gateway', async ({ assert }) => {
    // given
    const product = await ProductFactory.merge({ amount: '10.00' }).create()
    await GatewayFactory.merge({
      provider: 'gateway_one',
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    await GatewayFactory.merge({
      provider: 'gateway_two',
      name: 'Gateway 2',
      priority: 2,
      isActive: true,
    }).create()
    const successfulGateway = new FakeGatewayProcessor('gateway_two', { externalId: 'gw-2-tx' })
    const service = await makeTransactionService([
      new FakeGatewayProcessor('gateway_one', new Error('fail')),
      successfulGateway,
    ])
    const purchase = await service.purchase({
      name: 'John Doe',
      email: 'john@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [{ productId: product.id, quantity: 1 }],
    })

    // when
    const refunded = await service.refund(purchase.transaction.id.value)

    // then
    assert.equal(successfulGateway.refundCalls[0], 'gw-2-tx')
    assert.equal(refunded.transaction.status.value, 'refunded')
  })

  test('does not persist a transaction when all active gateways reject the charge', async ({
    assert,
  }) => {
    // given
    const product = await ProductFactory.merge({ amount: '10.00' }).create()
    await GatewayFactory.merge({
      provider: 'gateway_one',
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    await GatewayFactory.merge({
      provider: 'gateway_two',
      name: 'Gateway 2',
      priority: 2,
      isActive: true,
    }).create()
    const firstGateway = new FakeGatewayProcessor('gateway_one', new Error('fail'))
    const secondGateway = new FakeGatewayProcessor('gateway_two', new Error('fail'))
    const service = await makeTransactionService([firstGateway, secondGateway])

    // when
    const rejectedPurchase = () =>
      service.purchase({
        name: 'No Gateway Success',
        email: 'nogateway@example.com',
        cardNumber: '5569000000006063',
        cvv: '010',
        items: [{ productId: product.id, quantity: 1 }],
      })

    // then
    await assert.rejects(rejectedPurchase, TransactionPaymentFailedException)
    assert.equal(firstGateway.chargeCalls.length, 1)
    assert.equal(secondGateway.chargeCalls.length, 1)

    const persistedTransaction = await Transaction.all()
    const persistedClient = await Client.findBy('email', 'nogateway@example.com')

    assert.lengthOf(persistedTransaction, 0)
    assert.isNull(persistedClient)
  })

  test('creates a client when the purchase is authorized and the email does not exist yet', async ({
    assert,
  }) => {
    // given
    const product = await ProductFactory.merge({ amount: '10.00' }).create()
    await GatewayFactory.merge({
      provider: 'gateway_one',
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const processor = new FakeGatewayProcessor('gateway_one', { externalId: 'gw-missing-client' })
    const service = await makeTransactionService([processor])

    // when
    const purchase = await service.purchase({
      name: 'Missing Client',
      email: 'missing-client@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [{ productId: product.id, quantity: 1 }],
    })

    // then
    assert.equal(processor.chargeCalls.length, 1)
    assert.equal(purchase.client.email.value, 'missing-client@example.com')
    assert.isNotNull(await Client.findBy('email', 'missing-client@example.com'))
    assert.lengthOf(await Transaction.all(), 1)
  })

  test('returns not found when the transaction id does not exist', async ({ assert }) => {
    // given
    const service = await makeTransactionService([])

    // when
    const getMissingTransaction = () => service.getById(999999)

    // then
    await assert.rejects(getMissingTransaction, TransactionNotFoundException)
  })
})
