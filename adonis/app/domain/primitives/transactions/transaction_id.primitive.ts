import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

export class TransactionId {
  private constructor(public readonly value: number) {}

  public static create(value: number): TransactionId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid TransactionId`)
    }

    return new TransactionId(value)
  }
}
