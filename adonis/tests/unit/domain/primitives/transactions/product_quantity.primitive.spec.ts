import { test } from '@japa/runner'
import { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

test.group('ProductQuantity Primitive', () => {
  runPrimitiveTests({
    primitive: ProductQuantity,
    accepts: {
      title: 'accepts valid product quantities',
      values: [1, 2, 10],
    },
    rejects: {
      title: 'rejects invalid product quantities',
      values: [-1, 0, 1.2],
    },
  })
})
