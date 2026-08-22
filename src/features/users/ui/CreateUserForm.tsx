import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { createUser } from '../services/user.service';

const createUserSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(100),
  role: z.enum(['admin', 'trainer', 'receptionist', 'member']),
});

const ROLES = ['admin', 'trainer', 'receptionist', 'member'] as const;

type CreateUserValues = z.infer<typeof createUserSchema>;

export function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', password: '', role: 'member' },
  });

  const roleValue = watch('role');

  const onSubmit = async (values: CreateUserValues) => {
    setSubmitting(true);
    try {
      await createUser(values);
      toast.success('Usuario creado');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <Input id="name" placeholder="Juan Pérez" {...register('name')} />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="juan@test.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Rol</label>
        <Select
          value={roleValue}
          onValueChange={(v) => setValue('role', v as CreateUserValues['role'])}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-destructive text-sm">{errors.role.message}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear usuario'}
        </Button>
      </DialogFooter>
    </form>
  );
}
