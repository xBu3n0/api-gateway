import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

export class ProductPrice {
  private constructor(public readonly value: bigint) {}

  public static create(value: string) {
    const normalizedValue = value.trim()

    if (!/^\d+(?:\.\d{2})?$/.test(normalizedValue)) {
      throw new InvalidDomainException(`${value} is not a valid ProductPrice`)
    }

    return new ProductPrice(BigInt(normalizedValue.replace('.', '')))
  }

  public multiply(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid ProductPrice multiplier`)
    }

    return new ProductPrice(this.value * BigInt(value))
  }

  public sum(amount: ProductPrice) {
    return new ProductPrice(this.value + amount.value)
  }

  public toDecimalString() {
    const normalized = this.value.toString().padStart(3, '0')
    const whole = normalized.slice(0, -2) || '0'
    const cents = normalized.slice(-2)

    return `${whole}.${cents}`
  }
}
