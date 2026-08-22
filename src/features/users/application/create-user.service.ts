import type { CreateUserUseCase } from '../ports/create-user.input';
import type { UserRepository } from '../ports/user-repository.output';
import type { User } from '../domain/user';
import type { Result } from '../domain/result';
import type { CrearUsuarioDTO } from '../schemas/create-user.schema';

export class CreateUserServiceImpl implements CreateUserUseCase {
  private readonly userRepo: UserRepository;

  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(dto: CrearUsuarioDTO): Promise<Result<User, string>> {
    return this.userRepo.create(dto);
  }
}
