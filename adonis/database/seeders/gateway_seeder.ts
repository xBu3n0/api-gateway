import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/transactions/gateway'

export default class extends BaseSeeder {
  async run() {
    await Gateway.firstOrCreate(
      { provider: 'gateway_one' },
      {
        provider: 'gateway_one',
        name: 'gateway 1',
        priority: 1,
        isActive: true,
      }
    )

    await Gateway.firstOrCreate(
      { provider: 'gateway_two' },
      {
        provider: 'gateway_two',
        name: 'gateway 2',
        priority: 2,
        isActive: true,
      }
    )
  }
}
