import vine from '@vinejs/vine'

const name = () => vine.string().trim().minLength(1).maxLength(255)
const amount = () => vine.string().regex(/^\d+\.\d{2}$/)

export const createProductValidator = vine.create({
  name: name(),
  amount: amount(),
})

export const updateProductValidator = vine.create({
  name: name().optional(),
  amount: amount().optional(),
})
