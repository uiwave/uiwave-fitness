import type { UserRepository } from '../ports/user-repository.output';
import type { User } from '../domain/user';
import type { Result } from '../domain/result';
import { ok, err } from '../domain/result';
import { post, errorMessage } from '@/lib/apiClient';
import type { Envelope } from '@/features/shared/dom/envelope';
import type { CrearUsuarioDTO } from '../schemas/create-user.schema';

export class ApiUserRepository implements UserRepository {
  async create(dto: CrearUsuarioDTO): Promise<Result<User, string>> {
    try {
      const response = await post<Envelope<User>>('/users', dto);
      return ok(response.data);
    } catch (err_) {
      return err(errorMessage(err_));
    }
  }
}
