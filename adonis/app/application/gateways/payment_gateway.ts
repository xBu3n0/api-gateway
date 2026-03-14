import type GatewayEntity from '#domain/entities/shared/gateway.entity'

export interface ChargeGatewayInput {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface GatewayChargeResult {
  externalId: string
}

export default interface PaymentGateway {
  setup(): Promise<void>

  supports(gateway: GatewayEntity): boolean

  charge(input: ChargeGatewayInput): Promise<GatewayChargeResult>

  refund(externalId: string): Promise<void>
}
