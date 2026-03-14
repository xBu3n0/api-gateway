import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import PermissionDeniedException from '#domain/exceptions/shared/permission_denied.exception'
import TransactionPolicy from '#policies/transaction_policy'

export default class TransactionMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
      abilities?: ('readAll' | 'read' | 'refund')[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards)
    const transactionAuthorizer = ctx.bouncer.with(TransactionPolicy) as {
      denies(ability: 'readAll' | 'read' | 'refund'): Promise<boolean>
    }

    for (const ability of options.abilities || []) {
      if (await transactionAuthorizer.denies(ability)) {
        throw new PermissionDeniedException()
      }
    }

    return next()
  }
}
