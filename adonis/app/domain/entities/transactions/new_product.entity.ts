import type { ProductName } from '#domain/primitives/transactions/product_name.primitive'
import type { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'

export default class NewProductEntity {
  private constructor(
    readonly name: ProductName,
    readonly quantity: ProductQuantity
  ) {}

  static create(name: ProductName, quantity: ProductQuantity) {
    return new NewProductEntity(name, quantity)
  }
}
