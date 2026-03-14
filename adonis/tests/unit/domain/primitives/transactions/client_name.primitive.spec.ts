import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { ClientName } from '#domain/primitives/transactions/client_name.primitive'

const longClientName = 'a'.repeat(256)

test.group('ClientName Primitive', () => {
  test('accepts valid client names')
    .with(['John Doe', 'Ana', 'Maria da Silva'])
    .run(({ assert }, validName) => {
      // given
      const input = validName

      // when
      const clientName = ClientName.create(input)

      // then
      assert.equal(clientName.value, input)
    })

  test('rejects invalid client names')
    .with(['', '   ', longClientName])
    .run(({ assert }, invalidName) => {
      // given
      const input = invalidName

      // when
      const createInvalidClientName = () => ClientName.create(input)

      // then
      assert.throws(createInvalidClientName, InvalidDomainException)
    })
})
