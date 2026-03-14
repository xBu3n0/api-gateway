import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import SensitivePrimitive from '#domain/primitives/shared/sensitive.primitive'

const CVV_REGEX = /^\d{3}$/

export class Cvv extends SensitivePrimitive {
  private constructor(public readonly value: string) {
    super()
  }

  public static create(value: string): Cvv {
    if (!CVV_REGEX.test(value)) {
      throw new InvalidDomainException(`${value} is not a valid Cvv`)
    }

    return new Cvv(value)
  }
}
