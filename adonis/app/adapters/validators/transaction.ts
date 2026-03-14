import vine from '@vinejs/vine'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'

export const listTransactionsValidator = vine.create({
  status: vine.enum(Object.values(TransactionStatusEnum)).optional(),
  clientId: vine.number().withoutDecimals().positive().optional(),
  gatewayId: vine.number().withoutDecimals().positive().optional(),
})
