import { ProductPrice } from '#domain/primitives/transactions/product_price.primitive'
import { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import { ProductName } from '#domain/primitives/transactions/product_name.primitive'

export interface ProductRecord {
  id: number
  name: string
  amount: number
  createdAt?: Date
  updatedAt?: Date
}

export default class ProductEntity {
  private constructor(
    readonly id: ProductId,
    readonly name: ProductName,
    readonly amount: ProductPrice
  ) {}

  static fromRecord(record: ProductRecord) {
    return new ProductEntity(
      ProductId.create(record.id),
      ProductName.create(record.name),
      ProductPrice.create(record.amount)
    )
  }

  changeName(name: ProductName) {
    return new ProductEntity(this.id, name, this.amount)
  }

  changeAmount(amount: ProductPrice) {
    return new ProductEntity(this.id, this.name, amount)
  }
}
