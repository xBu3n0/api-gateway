import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

export class ProductPrice {
  private constructor(public readonly value: bigint) {}

  public static create(value: number) {
    if (!Number.isFinite(value) || value < 0) {
      throw new InvalidDomainException(`${value} is not a valid ProductPrice`)
    }

    const normalizedValue = value.toString()

    if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
      throw new InvalidDomainException(`${value} is not a valid ProductPrice`)
    }

    const [wholePart, decimalPart] = normalizedValue.split('.')
    const cents = decimalPart
      ? `${wholePart}${decimalPart.padEnd(2, '0').slice(0, 2)}`
      : wholePart

    return new ProductPrice(BigInt(cents))
  }

  public multiply(multiplier: number) {
    if (!Number.isInteger(multiplier) || multiplier < 0) {
      throw new InvalidDomainException(`${multiplier} is not a valid ProductPrice multiplier`)
    }

    return new ProductPrice(this.value * BigInt(multiplier))
  }

  public sum(price: ProductPrice) {
    return new ProductPrice(this.value + price.value)
  }
}
