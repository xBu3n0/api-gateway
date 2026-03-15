import GatewayEntity from '#domain/entities/shared/gateway.entity'
import type { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import type GatewayRepositoryInterface from '#repositories/transactions/gateway.repository'
import Gateway from '#models/transactions/gateway'

export default class LucidGatewayRepository implements GatewayRepositoryInterface {
  async list() {
    const gateways = await Gateway.query().orderBy('priority', 'asc').orderBy('id', 'asc')
    return gateways.map((gateway) =>
      GatewayEntity.fromRecord({
        id: gateway.id,
        provider: gateway.provider,
        name: gateway.name,
        isActive: gateway.isActive,
        priority: gateway.priority,
      })
    )
  }

  async listActiveByPriority() {
    const gateways = await Gateway.query()
      .where('is_active', true)
      .orderBy('priority', 'asc')
      .orderBy('id', 'asc')

    return gateways.map((gateway) =>
      GatewayEntity.fromRecord({
        id: gateway.id,
        provider: gateway.provider,
        name: gateway.name,
        isActive: gateway.isActive,
        priority: gateway.priority,
      })
    )
  }

  async findById(id: GatewayId) {
    const gateway = await Gateway.find(id.value)
    if (!gateway) {
      return null
    }

    return GatewayEntity.fromRecord({
      id: gateway.id,
      provider: gateway.provider,
      name: gateway.name,
      isActive: gateway.isActive,
      priority: gateway.priority,
    })
  }

  async update(entity: GatewayEntity) {
    const gateway = await Gateway.findOrFail(entity.id.value)

    gateway.name = entity.name.value
    gateway.isActive = entity.status.isActive()
    gateway.priority = entity.priority.value

    await gateway.save()

    return GatewayEntity.fromRecord({
      id: gateway.id,
      provider: gateway.provider,
      name: gateway.name,
      isActive: gateway.isActive,
      priority: gateway.priority,
    })
  }
}
