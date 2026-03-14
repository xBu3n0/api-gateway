import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import { TransactionStatus } from '#domain/primitives/transactions/transaction_status.primitive'

test.group('TransactionStatus Primitive', () => {
  test('accepts valid transaction statuses')
    .with(Object.values(TransactionStatusEnum))
    .run(({ assert }, validStatus) => {
      // given
      const input = validStatus

      // when
      const transactionStatus = TransactionStatus.create(input)

      // then
      assert.equal(transactionStatus.value, input)
    })

  test('rejects invalid transaction statuses')
    .with(['processing', 'completed', ''])
    .run(({ assert }, invalidStatus) => {
      // given
      const input = invalidStatus

      // when
      const createInvalidTransactionStatus = () => TransactionStatus.create(input)

      // then
      assert.throws(createInvalidTransactionStatus, InvalidDomainException)
    })

  test('creates the pending status', ({ assert }) => {
    // given

    // when
    const transactionStatus = TransactionStatus.pending()

    // then
    assert.equal(transactionStatus.value, TransactionStatusEnum.PENDING)
  })

  test('creates the authorized status', ({ assert }) => {
    // given

    // when
    const transactionStatus = TransactionStatus.authorized()

    // then
    assert.equal(transactionStatus.value, TransactionStatusEnum.AUTHORIZED)
  })

  test('creates the failed status', ({ assert }) => {
    // given

    // when
    const transactionStatus = TransactionStatus.failed()

    // then
    assert.equal(transactionStatus.value, TransactionStatusEnum.FAILED)
  })

  test('creates the refunded status', ({ assert }) => {
    // given

    // when
    const transactionStatus = TransactionStatus.refunded()

    // then
    assert.equal(transactionStatus.value, TransactionStatusEnum.REFUNDED)
  })

  test('matches the provided status', ({ assert }) => {
    // given
    const transactionStatus = TransactionStatus.authorized()

    // when
    const matchesStatus = transactionStatus.is(TransactionStatusEnum.AUTHORIZED)

    // then
    assert.isTrue(matchesStatus)
  })
})
