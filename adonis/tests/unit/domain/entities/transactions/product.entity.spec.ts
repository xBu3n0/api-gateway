import { test } from '@japa/runner'
import ProductEntity from '#domain/entities/shared/product.entity'
import { ProductName } from '#domain/primitives/transactions/product_name.primitive'
import { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'

test('builds a product entity from stored data', ({ assert }) => {
  // given
  const record = {
    id: 1,
    name: 'Online Course',
    quantity: 19990,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // when
  const entity = ProductEntity.fromRecord(record)

  // then
  assert.equal(entity.id.value, 1)
  assert.equal(entity.name.value, record.name)
  assert.equal(entity.quantity.value, record.quantity)
})

test('updates the product name while keeping the original immutable', ({ assert }) => {
  // given
  const entity = ProductEntity.fromRecord({
    id: 2,
    name: 'Basic Plan',
    quantity: 9900,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const updatedName = ProductName.create('Premium Plan')

  // when
  const renamed = entity.changeName(updatedName)

  // then
  assert.equal(entity.name.value, 'Basic Plan')
  assert.equal(entity.quantity.value, 9900)
  assert.equal(renamed.name.value, 'Premium Plan')
  assert.equal(renamed.quantity.value, entity.quantity.value)
  assert.equal(renamed.id.value, entity.id.value)
  assert.notStrictEqual(entity, renamed)
})

test('updates the product quantity while keeping the original immutable', ({ assert }) => {
  // given
  const entity = ProductEntity.fromRecord({
    id: 2,
    name: 'Basic Plan',
    quantity: 9900,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const updatedQuantity = ProductQuantity.create(19900)

  // when
  const repriced = entity.changeQuantity(updatedQuantity)

  // then
  assert.equal(entity.name.value, 'Basic Plan')
  assert.equal(entity.quantity.value, 9900)
  assert.equal(repriced.name.value, entity.name.value)
  assert.equal(repriced.quantity.value, 19900)
  assert.equal(repriced.id.value, entity.id.value)
  assert.notStrictEqual(entity, repriced)
})
