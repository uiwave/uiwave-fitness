import type { User } from '../domain/user';
import type { Result } from '../domain/result';
import type { CrearUsuarioDTO } from '../schemas/create-user.schema';

export interface CreateUserUseCase {
  execute(dto: CrearUsuarioDTO): Promise<Result<User, string>>;
}
