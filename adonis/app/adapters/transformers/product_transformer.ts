import type ProductEntity from '#domain/entities/shared/product.entity'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ProductTransformer extends BaseTransformer<ProductEntity> {
  toObject() {
    const { id, name, quantity } = this.resource

    return {
      id: id.value,
      name: name.value,
      quantity: quantity.value,
    }
  }
}
