import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import type { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'

export default abstract class GatewayRepositoryInterface {
  abstract list(): Promise<GatewayEntity[]>

  abstract listActiveByPriority(): Promise<GatewayEntity[]>

  abstract findById(id: GatewayId): Promise<GatewayEntity | null>

  abstract update(entity: GatewayEntity): Promise<GatewayEntity>
}
