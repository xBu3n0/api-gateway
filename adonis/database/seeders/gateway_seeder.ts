import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/transactions/gateway'

export default class extends BaseSeeder {
  async run() {
    await Gateway.firstOrCreate(
      { name: 'gateway 1' },
      {
        name: 'gateway 1',
        priority: 1,
        isActive: true,
      }
    )

    await Gateway.firstOrCreate(
      { name: 'gateway 2' },
      {
        name: 'gateway 2',
        priority: 2,
        isActive: true,
      }
    )
  }
}
