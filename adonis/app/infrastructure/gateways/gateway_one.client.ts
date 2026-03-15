import type { AxiosInstance } from 'axios'
import type PaymentGateway from '#application/gateways/payment_gateway'
import type { ChargeGatewayInput, GatewayChargeResult } from '#application/gateways/payment_gateway'
import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import gatewayConfig from '#config/gateways'
import BaseGatewayClient from '#infrastructure/gateways/base_gateway.client'

export default class GatewayOneClient extends BaseGatewayClient implements PaymentGateway {
  provider = 'gateway_one'

  private readonly publicClient: AxiosInstance
  private readonly authenticatedClient: AxiosInstance
  private authToken: string | null = null

  constructor() {
    super()

    this.publicClient = this.createClient({
      baseURL: gatewayConfig.one.baseUrl,
    })

    this.authenticatedClient = this.createBearerAuthenticatedClient({
      baseURL: gatewayConfig.one.baseUrl,
      getToken: async () => this.getToken(),
    })
  }

  async setup() {
    await this.getToken()
  }

  matchesGatewayProvider(gateway: GatewayEntity) {
    return gateway.provider === this.provider
  }

  async charge(input: ChargeGatewayInput): Promise<GatewayChargeResult> {
    const payload = await this.unwrap(
      this.authenticatedClient.post('/transactions', {
        amount: input.amount,
        name: input.name,
        email: input.email,
        cardNumber: input.cardNumber,
        cvv: input.cvv,
      }),
      'Gateway 1'
    )

    return {
      externalId: extractExternalId(payload),
    }
  }

  async refund(externalId: string) {
    await this.unwrap(
      this.authenticatedClient.post(`/transactions/${externalId}/charge_back`),
      'Gateway 1'
    )
  }

  private async getToken() {
    if (this.authToken) {
      return this.authToken
    }

    const payload = await this.unwrap(
      this.publicClient.post(gatewayConfig.one.loginPath, {
        email: gatewayConfig.one.loginEmail,
        token: gatewayConfig.one.loginToken,
      }),
      'Gateway 1 authentication'
    )

    if (typeof payload?.token !== 'string' || payload.token.length === 0) {
      throw new Error('Gateway 1 authentication did not return a token')
    }

    const token = payload.token
    this.authToken = token
    return token
  }
}

function extractExternalId(payload: any) {
  const candidates = [
    payload?.id,
    payload?.externalId,
    payload?.external_id,
    payload?.transactionId,
    payload?.data?.id,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return String(candidate)
    }
  }

  throw new Error('Gateway 1 response did not include an external transaction identifier')
}
