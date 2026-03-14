import type { ProductAmount } from '#domain/primitives/transactions/product_amount.primitive'
import type { ProductName } from '#domain/primitives/transactions/product_name.primitive'

export default class NewProductEntity {
  private constructor(
    readonly name: ProductName,
    readonly amount: ProductAmount
  ) {}

  static create(name: ProductName, amount: ProductAmount) {
    return new NewProductEntity(name, amount)
  }
}
