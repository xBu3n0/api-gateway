import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { TransactionId } from '#domain/primitives/transactions/transaction_id.primitive'

test.group('TransactionId Primitive', () => {
  test('accepts valid transaction identifiers')
    .with([1, 2, 100, 12345])
    .run(({ assert }, validId) => {
      // given
      const input = validId

      // when
      const transactionId = TransactionId.create(input)

      // then
      assert.equal(transactionId.value, input)
    })

  test('rejects invalid transaction identifiers')
    .with([0, -1, 1.2])
    .run(({ assert }, invalidId) => {
      // given
      const input = invalidId

      // when
      const createInvalidTransactionId = () => TransactionId.create(input)

      // then
      assert.throws(createInvalidTransactionId, InvalidDomainException)
    })
})
