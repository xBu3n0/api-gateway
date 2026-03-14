import factory from '@adonisjs/lucid/factories'
import Product from '#models/transactions/product'

export const ProductFactory = factory
  .define(Product, async ({ faker }) => {
    return {
      name: faker.commerce.productName().slice(0, 255),
      quantity: faker.number.int({ min: 1, max: 100_000 }),
    }
  })
  .build()
