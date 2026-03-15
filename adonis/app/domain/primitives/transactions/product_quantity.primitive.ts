import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

export class ProductQuantity {
  private constructor(public readonly value: number) {}

  public static create(value: number): ProductQuantity {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid ProductQuantity`)
    }

    return new ProductQuantity(value)
  }
}
