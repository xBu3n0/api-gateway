import factory from '@adonisjs/lucid/factories'
import Gateway from '#models/transactions/gateway'

export const GatewayFactory = factory
  .define(Gateway, async ({ faker }) => {
    return {
      provider: `gateway_${faker.string.alphanumeric(12).toLowerCase()}`,
      name: faker.company.name().slice(0, 255),
      priority: faker.number.int({ min: 1, max: 10 }),
      isActive: faker.datatype.boolean(),
    }
  })
  .build()
