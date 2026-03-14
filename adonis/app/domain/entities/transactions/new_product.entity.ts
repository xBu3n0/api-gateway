import type { ProductPrice } from '#domain/primitives/transactions/product_price.primitive'
import type { ProductName } from '#domain/primitives/transactions/product_name.primitive'

export default class NewProductEntity {
  private constructor(
    readonly name: ProductName,
    readonly amount: ProductPrice
  ) {}

  static create(name: ProductName, amount: ProductPrice) {
    return new NewProductEntity(name, amount)
  }
}
