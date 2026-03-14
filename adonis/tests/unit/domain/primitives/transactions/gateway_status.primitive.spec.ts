import { test } from '@japa/runner'
import { GatewayStatus } from '#domain/primitives/transactions/gateway_status.primitive'

test.group('GatewayStatus Primitive', () => {
  test('creates an active status from a persisted boolean', ({ assert }) => {
    // given
    const input = true

    // when
    const status = GatewayStatus.create(input)

    // then
    assert.isTrue(status.value)
    assert.isTrue(status.isActive())
    assert.isFalse(status.isInactive())
  })

  test('creates an inactive status from a persisted boolean', ({ assert }) => {
    // given
    const input = false

    // when
    const status = GatewayStatus.create(input)

    // then
    assert.isFalse(status.value)
    assert.isFalse(status.isActive())
    assert.isTrue(status.isInactive())
  })

  test('creates an active status from the semantic factory', ({ assert }) => {
    // when
    const active = GatewayStatus.active()

    // then
    assert.isTrue(active.isActive())
    assert.isFalse(active.isInactive())
  })

  test('creates an inactive status from the semantic factory', ({ assert }) => {
    // when
    const inactive = GatewayStatus.inactive()

    // then
    assert.isTrue(inactive.isInactive())
    assert.isFalse(inactive.isActive())
  })
})
