import { test } from '@japa/runner'
import ProductEntity from '#domain/entities/shared/product.entity'
import { ProductName } from '#domain/primitives/transactions/product_name.primitive'
import { ProductPrice } from '#domain/primitives/transactions/product_price.primitive'

test('builds a product entity from stored data', ({ assert }) => {
  // given
  const record = {
    id: 1,
    name: 'Online Course',
    amount: '199.90',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // when
  const entity = ProductEntity.fromRecord(record)

  // then
  assert.equal(entity.id.value, 1)
  assert.equal(entity.name.value, record.name)
  assert.equal(entity.amount.value, 19990n)
})

test('updates the product name while keeping the original immutable', ({ assert }) => {
  // given
  const entity = ProductEntity.fromRecord({
    id: 2,
    name: 'Basic Plan',
    amount: '99.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const updatedName = ProductName.create('Premium Plan')

  // when
  const renamed = entity.changeName(updatedName)

  // then
  assert.equal(entity.name.value, 'Basic Plan')
  assert.equal(entity.amount.value, 9900n)
  assert.equal(renamed.name.value, 'Premium Plan')
  assert.equal(renamed.amount.value, entity.amount.value)
  assert.equal(renamed.id.value, entity.id.value)
  assert.notStrictEqual(entity, renamed)
})

test('updates the product amount while keeping the original immutable', ({ assert }) => {
  // given
  const entity = ProductEntity.fromRecord({
    id: 2,
    name: 'Basic Plan',
    amount: '99.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const updatedAmount = ProductPrice.create('199.00')

  // when
  const updated = entity.changeAmount(updatedAmount)

  // then
  assert.equal(entity.name.value, 'Basic Plan')
  assert.equal(entity.amount.value, 9900n)
  assert.equal(updated.amount.value, 19900n)
  assert.equal(updated.id.value, entity.id.value)
  assert.notStrictEqual(entity, updated)
})
