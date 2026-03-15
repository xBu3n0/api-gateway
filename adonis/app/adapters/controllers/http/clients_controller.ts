import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ClientService from '#services/transactions/client.service'
import ClientTransformer from '#transformers/client_transformer'
import TransactionDetailsTransformer from '#transformers/transaction_details_transformer'

@inject()
export default class ClientsController {
  constructor(private readonly clientService: ClientService) {}

  async index({ serialize }: HttpContext) {
    const clients = await this.clientService.listClients()

    return serialize(ClientTransformer.transform(clients))
  }

  async show({ params, serialize }: HttpContext) {
    const result = await this.clientService.getById(Number(params.id))
    const serializedClient = await serialize(ClientTransformer.transform(result.client))
    const serializedTransactions = await serialize(
      TransactionDetailsTransformer.transform(result.transactions)
    )

    return {
      ...serializedClient.data,
      transactions: serializedTransactions.data,
    }
  }
}
