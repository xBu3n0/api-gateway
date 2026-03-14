import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import TransactionService from '#services/transactions/transaction.service'
import TransactionTransformer from '#transformers/transaction_transformer'
import TransactionDetailsTransformer from '#transformers/transaction_details_transformer'
import { listTransactionsValidator } from '#validators/transaction'

@inject()
export default class TransactionsController {
  constructor(private readonly transactionService: TransactionService) {}

  async index({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listTransactionsValidator, {
      data: request.qs(),
    })
    const transactions = await this.transactionService.listTransactions(filters)

    return serialize(TransactionTransformer.transform(transactions))
  }

  async show({ params, serialize }: HttpContext) {
    const transaction = await this.transactionService.getById(Number(params.id))

    return serialize(TransactionDetailsTransformer.transform(transaction))
  }

  async refund({ params, serialize }: HttpContext) {
    const transaction = await this.transactionService.refund(Number(params.id))

    return serialize(TransactionDetailsTransformer.transform(transaction))
  }
}
