import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { ProductPrice } from '#domain/primitives/transactions/product_price.primitive'

test.group('ProductPrice Primitive', () => {
  test('accepts valid product prices')
    .with([
      { input: 0, expected: 0n },
      { input: 1, expected: 1n },
      { input: 10.5, expected: 1050n },
      { input: 10.99, expected: 1099n },
      { input: 99999, expected: 99999n },
    ])
    .run(({ assert }, { input, expected }) => {
      // given
      const validPrice = input

      // when
      const price = ProductPrice.create(validPrice)

      // then
      assert.equal(price.value, expected)
    })

  test('rejects invalid product prices')
    .with([-1, Number.NaN, Number.POSITIVE_INFINITY])
    .run(({ assert }, invalidPrice) => {
      // given
      const input = invalidPrice

      // when
      const createInvalidPrice = () => ProductPrice.create(input)

      // then
      assert.throws(createInvalidPrice, InvalidDomainException)
    })

  test('multiplies a price by a quantity', ({ assert }) => {
    // given
    const price = ProductPrice.create(1999)

    // when
    const subtotal = price.multiply(3)

    // then
    assert.equal(subtotal.value, 5997n)
  })

  test('sums two prices', ({ assert }) => {
    // given
    const firstPrice = ProductPrice.create(1500)
    const secondPrice = ProductPrice.create(2500)

    // when
    const totalPrice = firstPrice.sum(secondPrice)

    // then
    assert.equal(totalPrice.value, 4000n)
  })
})
