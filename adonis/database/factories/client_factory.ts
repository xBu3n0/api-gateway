import factory from '@adonisjs/lucid/factories'
import Client from '#models/transactions/client'

export const ClientFactory = factory
  .define(Client, async ({ faker }) => {
    return {
      name: faker.person.fullName().slice(0, 255),
      email: faker.internet.email().toLowerCase(),
    }
  })
  .build()
