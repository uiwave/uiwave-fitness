import type { UserRole } from '@/features/users/domain/user-role';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
}
