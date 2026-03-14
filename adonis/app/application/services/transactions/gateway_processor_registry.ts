import GatewayProcessorNotConfiguredException from '#domain/exceptions/transactions/gateway_processor_not_configured.exception'
import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import type PaymentGateway from '#application/gateways/payment_gateway'
import GatewayOneClient from '#infrastructure/gateways/gateway_one.client'
import GatewayTwoClient from '#infrastructure/gateways/gateway_two.client'

export default class GatewayProcessorRegistry {
  constructor(
    private readonly processors: PaymentGateway[] = [new GatewayOneClient(), new GatewayTwoClient()]
  ) {}

  getFor(gateway: GatewayEntity): PaymentGateway {
    const processor = this.processors.find((candidate) => candidate.supports(gateway))

    if (!processor) {
      throw new GatewayProcessorNotConfiguredException(
        `No payment gateway processor was configured for '${gateway.name.value}'.`
      )
    }

    return processor
  }
}
