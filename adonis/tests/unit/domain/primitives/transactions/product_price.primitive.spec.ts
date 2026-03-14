import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { ProductPrice } from '#domain/primitives/transactions/product_price.primitive'

test.group('ProductPrice Primitive', () => {
  test('accepts valid product amounts')
    .with([
      { input: '0', expected: 0n },
      { input: '1', expected: 1n },
      { input: '10.50', expected: 1050n },
      { input: '10.99', expected: 1099n },
      { input: '1050', expected: 1050n },
      { input: '1099', expected: 1099n },
      { input: '99999', expected: 99999n },
    ])
    .run(({ assert }, { input, expected }) => {
      // given
      const validAmount = input

      // when
      const amount = ProductPrice.create(validAmount)

      // then
      assert.equal(amount.value, expected)
    })

  test('rejects invalid product amounts')
    .with(['-1', '10.5', 'abc', ''])
    .run(({ assert }, invalidAmount) => {
      // given
      const input = invalidAmount

      // when
      const createInvalidAmount = () => ProductPrice.create(input)

      // then
      assert.throws(createInvalidAmount, InvalidDomainException)
    })

  test('multiplies an amount by a quantity', ({ assert }) => {
    // given
    const amount = ProductPrice.create('1999')

    // when
    const subtotal = amount.multiply(3)

    // then
    assert.equal(subtotal.value, 5997n)
  })

  test('sums two amounts', ({ assert }) => {
    // given
    const firstAmount = ProductPrice.create('1500')
    const secondAmount = ProductPrice.create('2500')

    // when
    const totalAmount = firstAmount.sum(secondAmount)

    // then
    assert.equal(totalAmount.value, 4000n)
  })
})
