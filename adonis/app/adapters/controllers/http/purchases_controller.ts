import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { InferData } from '@adonisjs/http-transformers/types'
import TransactionService from '#services/transactions/transaction.service'
import type { PurchaseInput } from '#services/transactions/transaction.service'
import TransactionDetailsTransformer from '#transformers/transaction_details_transformer'
import { createPurchaseValidator } from '#validators/purchase'

type SerializedPurchaseItem = InferData<TransactionDetailsTransformer>['items'][number]

@inject()
export default class PurchasesController {
  constructor(private readonly transactionService: TransactionService) {}

  async store({ auth, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createPurchaseValidator)

    const transaction = await this.transactionService.purchase({
      userId: auth.getUserOrFail().id,
      ...payload,
    })

    const serializedTransaction = await serialize(
      TransactionDetailsTransformer.transform(transaction)
    )

    return {
      data: {
        ...serializedTransaction.data,
        items: this.attachParcialPrices(serializedTransaction.data.items, payload.items),
        total_price: this.calculateTotalPrice(payload.items),
      },
    }
  }

  private attachParcialPrices(
    items: SerializedPurchaseItem[],
    requestedItems: PurchaseInput['items']
  ) {
    const requestedItemsByProductId = this.groupRequestedItemsByProductId(requestedItems)

    return items.map((item) => {
      const matchingItems = requestedItemsByProductId.get(item.product.id) ?? []
      const requestedItem = matchingItems.shift()

      if (!requestedItem) {
        return item
      }

      return {
        ...item,
        parcial_price: this.calculatePrice(requestedItem.price, requestedItem.quantity),
      }
    })
  }

  private groupRequestedItemsByProductId(items: PurchaseInput['items']) {
    const itemsByProductId = new Map<number, PurchaseInput['items']>()

    for (const item of items) {
      const groupedItems = itemsByProductId.get(item.productId) ?? []
      groupedItems.push(item)
      itemsByProductId.set(item.productId, groupedItems)
    }

    return itemsByProductId
  }

  private calculateTotalPrice(items: PurchaseInput['items']) {
    return items.reduce((total, item) => total + this.calculatePrice(item.price, item.quantity), 0)
  }

  private calculatePrice(price: string, quantity: number) {
    const [wholePart, decimalPart] = price.split('.')
    const cents = Number.parseInt(wholePart, 10) * 100 + Number.parseInt(decimalPart, 10)

    return (cents * quantity) / 100
  }
}
