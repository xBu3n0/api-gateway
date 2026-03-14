import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import GatewayService from '#services/transactions/gateway.service'
import GatewayNotFoundException from '#domain/exceptions/transactions/gateway_not_found.exception'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { cleanupTransactionsDatabase, runAceCommand } from './test_utils.js'

test.group('GatewayService integration (real database)', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupTransactionsDatabase()
  })

  group.each.timeout(10000)

  test('lists gateways ordered by priority', async ({ assert }) => {
    // given
    const service = await app.container.make(GatewayService)
    const first = await GatewayFactory.merge({ priority: 2, isActive: true }).create()
    const second = await GatewayFactory.merge({ priority: 1, isActive: true }).create()

    // when
    const gateways = await service.listGateways()

    // then
    assert.deepEqual(
      gateways.map((gateway) => gateway.id.value),
      [second.id, first.id]
    )
  })

  test('updates the gateway priority without renormalizing the others', async ({ assert }) => {
    // given
    const service = await app.container.make(GatewayService)
    const first = await GatewayFactory.merge({ priority: 1, isActive: true }).create()
    const second = await GatewayFactory.merge({ priority: 2, isActive: true }).create()

    // when
    const reprioritized = await service.updatePriority(second.id, 1)

    // then
    assert.equal(reprioritized.priority.value, 1)

    // when
    const listed = await service.listGateways()

    // then
    assert.deepEqual(
      listed.map((gateway) => ({ id: gateway.id.value, priority: gateway.priority.value })),
      [
        { id: first.id, priority: 1 },
        { id: second.id, priority: 1 },
      ]
    )
  })

  test('disables a gateway', async ({ assert }) => {
    // given
    const service = await app.container.make(GatewayService)
    const first = await GatewayFactory.merge({ priority: 1, isActive: true }).create()
    const second = await GatewayFactory.merge({ priority: 2, isActive: true }).create()

    // when
    const disabled = await service.updateStatus(first.id, false)

    // then
    assert.isTrue(disabled.status.isInactive())

    // when
    const listed = await service.listGateways()

    // then
    assert.deepEqual(
      listed.map((gateway) => ({ id: gateway.id.value, priority: gateway.priority.value })),
      [
        { id: first.id, priority: 1 },
        { id: second.id, priority: 2 },
      ]
    )
  })

  test('returns not found when the gateway id does not exist', async ({ assert }) => {
    // given
    const service = await app.container.make(GatewayService)

    // when
    const getMissingGateway = () => service.getById(999999)

    // then
    await assert.rejects(getMissingGateway, GatewayNotFoundException)
  })
})
