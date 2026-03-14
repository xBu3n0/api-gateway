import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'

test.group('ProductQuantity Primitive', () => {
  test('accepts valid product quantities')
    .with([1, 2, 10, 999])
    .run(({ assert }, validQuantity) => {
      // given
      const input = validQuantity

      // when
      const productQuantity = ProductQuantity.create(input)

      // then
      assert.equal(productQuantity.value, input)
    })

  test('rejects invalid product quantities')
    .with([0, -1, 1.5])
    .run(({ assert }, invalidQuantity) => {
      // given
      const input = invalidQuantity

      // when
      const createInvalidProductQuantity = () => ProductQuantity.create(input)

      // then
      assert.throws(createInvalidProductQuantity, InvalidDomainException)
    })

  test('multiplies the quantity by the product amount')
    .with([
      { quantity: 1, amount: 1000, expected: 1000 },
      { quantity: 3, amount: 2500, expected: 7500 },
    ])
    .run(({ assert }, scenario) => {
      // given
      const productQuantity = ProductQuantity.create(scenario.quantity)

      // when
      const totalAmount = productQuantity.multiply(scenario.amount)

      // then
      assert.equal(totalAmount, scenario.expected)
    })
})
