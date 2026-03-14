import { inject } from '@adonisjs/core'
import GatewayRepositoryInterface from '#repositories/transactions/gateway.repository'
import GatewayNotFoundException from '#domain/exceptions/transactions/gateway_not_found.exception'
import { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import { GatewayPriority } from '#domain/primitives/transactions/gateway_priority.primitive'

@inject()
export default class GatewayService {
  constructor(private readonly gatewayRepository: GatewayRepositoryInterface) {}

  async listGateways() {
    return this.gatewayRepository.list()
  }

  async updateStatus(id: number, isActive: boolean) {
    const gateway = await this.ensureExists(GatewayId.create(id))
    const updated = isActive ? gateway.activate() : gateway.deactivate()

    return this.gatewayRepository.update(updated)
  }

  async updatePriority(id: number, priority: number) {
    const gateway = await this.ensureExists(GatewayId.create(id))
    const updated = gateway.changePriority(GatewayPriority.create(priority))

    return this.gatewayRepository.update(updated)
  }

  async getById(id: number) {
    return this.ensureExists(GatewayId.create(id))
  }

  private async ensureExists(id: GatewayId) {
    const gateway = await this.gatewayRepository.findById(id)
    if (!gateway) {
      throw new GatewayNotFoundException(`Gateway '${id.value}' was not found.`)
    }

    return gateway
  }
}
