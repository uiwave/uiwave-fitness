import { post, errorMessage } from '@/lib/apiClient';
import type { Envelope, User } from '@/types/api';

export interface CreateUserValues {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function createUser(data: CreateUserValues): Promise<void> {
  try {
    await post<Envelope<User>>('/users', data);
  } catch (err) {
    throw new Error(errorMessage(err));
  }
}
