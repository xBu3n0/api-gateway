import factory from '@adonisjs/lucid/factories'
import Client from '#models/transactions/client'
import { UserFactory } from '#database/factories/user_factory'

export const ClientFactory = factory
  .define(Client, async ({ faker }) => {
    const user = await UserFactory.make()
    await user.save()

    return {
      name: faker.person.fullName().slice(0, 255),
      email: faker.internet.email().toLowerCase(),
      userId: user.id,
    }
  })
  .build()
