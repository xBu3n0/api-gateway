import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import SensitivePrimitive from '#domain/primitives/shared/sensitive.primitive'

const CARD_NUMBER_REGEX = /^\d{16}$/

export class CardNumber extends SensitivePrimitive {
  private constructor(public readonly value: string) {
    super()
  }

  public static create(value: string): CardNumber {
    if (!CARD_NUMBER_REGEX.test(value)) {
      throw new InvalidDomainException(`${value} is not a valid CardNumber`)
    }

    return new CardNumber(value)
  }

  public lastFourDigits() {
    return valueToCardLastNumbers(this.value)
  }
}

function valueToCardLastNumbers(value: string) {
  const lastFourDigits = value.slice(-4)
  return lastFourDigits
}
