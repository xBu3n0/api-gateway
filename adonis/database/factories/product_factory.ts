import factory from '@adonisjs/lucid/factories'
import Product from '#models/transactions/product'

export const ProductFactory = factory
  .define(Product, async ({ faker }) => {
    return {
      name: faker.commerce.productName().slice(0, 255),
      amount: faker.commerce.price({ min: 1, max: 1000, dec: 2 }),
    }
  })
  .build()
