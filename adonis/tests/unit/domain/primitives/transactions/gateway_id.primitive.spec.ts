import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'

test.group('GatewayId Primitive', () => {
  test('accepts valid gateway identifiers')
    .with([1, 2, 100, 12345])
    .run(({ assert }, validId) => {
      // given
      const input = validId

      // when
      const gatewayId = GatewayId.create(input)

      // then
      assert.equal(gatewayId.value, input)
    })

  test('rejects invalid gateway identifiers')
    .with([0, 1.2, -1])
    .run(({ assert }, invalidId) => {
      // given
      const input = invalidId

      // when
      const createInvalidGatewayId = () => GatewayId.create(input)

      // then
      assert.throws(createInvalidGatewayId, InvalidDomainException)
    })
})
