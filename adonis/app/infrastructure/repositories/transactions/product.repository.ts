import ProductEntity from '#domain/entities/shared/product.entity'
import type NewProductEntity from '#domain/entities/transactions/new_product.entity'
import type { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import type ProductRepositoryInterface from '#repositories/transactions/product.repository'
import Product from '#models/transactions/product'

export default class LucidProductRepository implements ProductRepositoryInterface {
  async list() {
    const products = await Product.query().orderBy('name', 'asc')
    return products.map((product) =>
      ProductEntity.fromRecord({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
      })
    )
  }

  async findById(id: ProductId) {
    const product = await Product.find(id.value)
    if (!product) {
      return null
    }

    return ProductEntity.fromRecord({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
    })
  }

  async findByIds(ids: ProductId[]) {
    if (ids.length === 0) {
      return []
    }

    const uniqueIds = [...new Set(ids.map((id) => id.value))]
    const products = await Product.query().whereIn('id', uniqueIds)
    return products.map((product) =>
      ProductEntity.fromRecord({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
      })
    )
  }

  async create(newProduct: NewProductEntity) {
    const product = await Product.create({
      name: newProduct.name.value,
      quantity: Number(newProduct.quantity.value),
    })

    return ProductEntity.fromRecord({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
    })
  }

  async update(entity: ProductEntity) {
    const product = await Product.findOrFail(entity.id.value)

    product.name = entity.name.value
    product.quantity = Number(entity.quantity.value)

    await product.save()

    return ProductEntity.fromRecord({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
    })
  }

  async delete(id: ProductId) {
    const product = await Product.findOrFail(id.value)
    await product.delete()
  }
}
