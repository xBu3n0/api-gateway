import type ClientEntity from '#domain/entities/shared/client.entity'
import type { UserId } from '#domain/primitives/auth/user_id.primitive'
import type { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import type { Email } from '#domain/primitives/shared/email.primitive'

export default abstract class ClientRepositoryInterface {
  abstract list(): Promise<ClientEntity[]>

  abstract findById(id: ClientId): Promise<ClientEntity | null>

  abstract findByUserId(userId: UserId): Promise<ClientEntity | null>

  abstract findByEmail(email: Email): Promise<ClientEntity | null>
}
