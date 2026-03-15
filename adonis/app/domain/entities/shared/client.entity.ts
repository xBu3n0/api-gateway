import { Email } from '#domain/primitives/shared/email.primitive'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import { ClientName } from '#domain/primitives/transactions/client_name.primitive'

export interface ClientRecord {
  id: number
  name: string
  email: string
  createdAt?: Date
  updatedAt?: Date
}

export default class ClientEntity {
  private constructor(
    readonly id: ClientId,
    readonly name: ClientName,
    readonly email: Email
  ) {}

  static fromRecord(record: ClientRecord) {
    return new ClientEntity(
      ClientId.create(record.id),
      ClientName.create(record.name),
      Email.create(record.email)
    )
  }
}
