import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProductService from '#services/transactions/product.service'
import ProductTransformer from '#transformers/product_transformer'
import { createProductValidator, updateProductValidator } from '#validators/product'

@inject()
export default class ProductsController {
  constructor(private readonly productService: ProductService) {}

  async index({ serialize }: HttpContext) {
    const products = await this.productService.listProducts()

    return serialize(ProductTransformer.transform(products))
  }

  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const product = await this.productService.create(payload)

    return serialize(ProductTransformer.transform(product))
  }

  async show({ params, serialize }: HttpContext) {
    const product = await this.productService.getById(Number(params.id))

    return serialize(ProductTransformer.transform(product))
  }

  async update({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidator)
    const product = await this.productService.update(Number(params.id), payload)

    return serialize(ProductTransformer.transform(product))
  }

  async destroy({ params }: HttpContext) {
    await this.productService.delete(Number(params.id))

    return {
      message: 'Product removed successfully',
    }
  }
}
