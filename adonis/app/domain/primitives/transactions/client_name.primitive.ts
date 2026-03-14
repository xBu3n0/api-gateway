import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

const CLIENT_NAME_MAX_LENGTH = 255

export class ClientName {
  private constructor(public readonly value: string) {}

  public static create(value: string): ClientName {
    if (value.trim().length === 0 || value.length > CLIENT_NAME_MAX_LENGTH) {
      throw new InvalidDomainException(`${value} is not a valid ClientName`)
    }

    return new ClientName(value)
  }
}
