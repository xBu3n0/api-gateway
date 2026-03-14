import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import PermissionDeniedException from '#domain/exceptions/shared/permission_denied.exception'
import ProductPolicy from '#policies/product_policy'

export default class ProductMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
      abilities?: ('create' | 'readAll' | 'read' | 'update' | 'delete')[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards)
    const productAuthorizer = ctx.bouncer.with(ProductPolicy) as {
      denies(ability: 'create' | 'readAll' | 'read' | 'update' | 'delete'): Promise<boolean>
    }

    for (const ability of options.abilities || []) {
      if (await productAuthorizer.denies(ability)) {
        throw new PermissionDeniedException()
      }
    }

    return next()
  }
}
