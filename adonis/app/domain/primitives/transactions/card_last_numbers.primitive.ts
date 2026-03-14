import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

const CARD_LAST_NUMBERS_REGEX = /^\d{4}$/

export class CardLastNumbers {
  private constructor(public readonly value: string) {}

  public static create(value: string): CardLastNumbers {
    if (!CARD_LAST_NUMBERS_REGEX.test(value)) {
      throw new InvalidDomainException(`${value} is not a valid CardLastNumbers`)
    }

    return new CardLastNumbers(value)
  }
}
