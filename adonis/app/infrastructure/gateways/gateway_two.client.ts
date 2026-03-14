import type { AxiosInstance } from 'axios'
import type PaymentGateway from '#application/gateways/payment_gateway'
import type { ChargeGatewayInput, GatewayChargeResult } from '#application/gateways/payment_gateway'
import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import gatewayConfig, { normalizeGatewayName } from '#config/gateways'
import BaseGatewayClient from '#infrastructure/gateways/base_gateway.client'

export default class GatewayTwoClient extends BaseGatewayClient implements PaymentGateway {
  private readonly authenticatedClient: AxiosInstance

  constructor() {
    super()

    this.authenticatedClient = this.createHeaderAuthenticatedClient({
      baseURL: gatewayConfig.two.baseUrl,
    })
  }

  supports(gateway: GatewayEntity) {
    const normalizedName = normalizeGatewayName(gateway.name.value)
    return ['gateway2', normalizeGatewayName(gatewayConfig.two.name)].includes(normalizedName)
  }

  async charge(input: ChargeGatewayInput): Promise<GatewayChargeResult> {
    const payload = await this.unwrap(
      this.authenticatedClient.post('/transacoes', {
        valor: input.amount,
        nome: input.name,
        email: input.email,
        numeroCartao: input.cardNumber,
        cvv: input.cvv,
      }),
      'Gateway 2'
    )

    return {
      externalId: extractExternalId(payload),
    }
  }

  async refund(externalId: string) {
    await this.unwrap(
      this.authenticatedClient.post('/transacoes/reembolso', {
        id: externalId,
      }),
      'Gateway 2'
    )
  }
}

function extractExternalId(payload: any) {
  const candidates = [payload?.id, payload?.externalId, payload?.external_id, payload?.data?.id]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return String(candidate)
    }
  }

  throw new Error('Gateway 2 response did not include an external transaction identifier')
}
