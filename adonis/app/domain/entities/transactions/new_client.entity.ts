import type { Email } from '#domain/primitives/shared/email.primitive'
import type { ClientName } from '#domain/primitives/transactions/client_name.primitive'

export default class NewClientEntity {
  private constructor(
    readonly name: ClientName,
    readonly email: Email
  ) {}

  static create(name: ClientName, email: Email) {
    return new NewClientEntity(name, email)
  }
}
