import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import TransactionService from '#services/transactions/transaction.service'
import TransactionTransformer from '#transformers/transaction_transformer'
import { createPurchaseValidator } from '#validators/purchase'

@inject()
export default class PurchasesController {
  constructor(private readonly transactionService: TransactionService) {}

  async store({ auth, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createPurchaseValidator)
    const transaction = await this.transactionService.purchase({
      userId: auth.getUserOrFail().id,
      ...payload,
    })

    return serialize(TransactionTransformer.transform(transaction))
  }
}
