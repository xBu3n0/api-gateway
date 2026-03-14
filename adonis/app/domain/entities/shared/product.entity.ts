import { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import { ProductName } from '#domain/primitives/transactions/product_name.primitive'
import { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'

export interface ProductRecord {
  id: number
  name: string
  quantity: number
  createdAt?: Date
  updatedAt?: Date
}

export default class ProductEntity {
  private constructor(
    readonly id: ProductId,
    readonly name: ProductName,
    readonly quantity: ProductQuantity
  ) {}

  static fromRecord(record: ProductRecord) {
    return new ProductEntity(
      ProductId.create(record.id),
      ProductName.create(record.name),
      ProductQuantity.create(record.quantity)
    )
  }

  changeName(name: ProductName) {
    return new ProductEntity(this.id, name, this.quantity)
  }

  changeQuantity(quantity: ProductQuantity) {
    return new ProductEntity(this.id, this.name, quantity)
  }
}
