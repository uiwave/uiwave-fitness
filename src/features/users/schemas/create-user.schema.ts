import { z } from 'zod';
import { ROLES } from '@/features/users/domain/user-role';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  email: z.email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(100),
  role: z.enum(ROLES),
});

export type CrearUsuarioDTO = z.infer<typeof createUserSchema>;
