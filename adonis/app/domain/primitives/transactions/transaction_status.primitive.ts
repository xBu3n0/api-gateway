import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'

export class TransactionStatus {
  private constructor(public readonly value: TransactionStatusEnum) {}

  public static create(value: string): TransactionStatus {
    if (!Object.values(TransactionStatusEnum).includes(value as TransactionStatusEnum)) {
      throw new InvalidDomainException(`${value} is not a valid TransactionStatus`)
    }

    return new TransactionStatus(value as TransactionStatusEnum)
  }

  public static pending() {
    return new TransactionStatus(TransactionStatusEnum.PENDING)
  }

  public static authorized() {
    return new TransactionStatus(TransactionStatusEnum.AUTHORIZED)
  }

  public static failed() {
    return new TransactionStatus(TransactionStatusEnum.FAILED)
  }

  public static refunded() {
    return new TransactionStatus(TransactionStatusEnum.REFUNDED)
  }

  public is(status: TransactionStatusEnum) {
    return this.value === status
  }
}
