import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

const EXTERNAL_TRANSACTION_ID_MAX_LENGTH = 255

export class ExternalTransactionId {
  private constructor(public readonly value: string) {}

  public static create(value: string): ExternalTransactionId {
    if (value.trim().length === 0 || value.length > EXTERNAL_TRANSACTION_ID_MAX_LENGTH) {
      throw new InvalidDomainException(`${value} is not a valid ExternalTransactionId`)
    }

    return new ExternalTransactionId(value)
  }
}
