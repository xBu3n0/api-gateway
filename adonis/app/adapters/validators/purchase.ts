import vine from '@vinejs/vine'
import { EMAIL_FORMAT_REGEX } from '#domain/shared/consts'

export const createPurchaseValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  email: vine.string().regex(EMAIL_FORMAT_REGEX).maxLength(254),
  cardNumber: vine.string().regex(/^\d{16}$/),
  cvv: vine.string().regex(/^\d{3}$/),
  items: vine
    .array(
      vine.object({
        productId: vine.number().withoutDecimals().positive(),
        quantity: vine.number().withoutDecimals().positive(),
      })
    )
    .minLength(1),
})
