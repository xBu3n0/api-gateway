import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'

export class GatewayId {
  private constructor(public readonly value: number) {}

  public static create(value: number): GatewayId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid GatewayId`)
    }

    return new GatewayId(value)
  }
}
