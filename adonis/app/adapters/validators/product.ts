import vine from '@vinejs/vine'

const name = () => vine.string().trim().minLength(1).maxLength(255)
const quantity = () => vine.number().withoutDecimals().positive()

export const createProductValidator = vine.create({
  name: name(),
  quantity: quantity(),
})

export const updateProductValidator = vine.create({
  name: name().optional(),
  quantity: quantity().optional(),
})
