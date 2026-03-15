import type ClientEntity from '#domain/entities/shared/client.entity'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ClientTransformer extends BaseTransformer<ClientEntity> {
  toObject() {
    const { id, name, email } = this.resource

    return {
      id: id.value,
      name: name.value,
      email: email.value,
    }
  }
}
