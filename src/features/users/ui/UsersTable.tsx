import { Ban, ShieldCheck, Trash2, Unlock } from 'lucide-react';

import type { User } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/DataState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDateTime } from '@/lib/format';

interface UsersTableProps {
  users: User[];
  currentUserId?: string;
  isAdmin: boolean;
  onChangeRole: (user: User) => void;
  onToggleBan: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTable({
  users,
  currentUserId,
  isAdmin,
  onChangeRole,
  onToggleBan,
  onDelete,
}: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Creado</TableHead>

          {isAdmin && (
            <TableHead className="w-28 text-right">Acciones</TableHead>
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={isAdmin ? 6 : 5}>
              <EmptyState />
            </TableCell>
          </TableRow>
        )}

        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              {user.name}

              {user.id === currentUserId && (
                <Badge variant="outline" className="ml-2 font-normal">
                  tú
                </Badge>
              )}
            </TableCell>

            <TableCell>{user.email}</TableCell>

            <TableCell>
              <StatusBadge status={user.role} />
            </TableCell>

            <TableCell>
              {user.banned ? (
                <Badge
                  variant="outline"
                  className="bg-red-500/10 text-red-600 dark:text-red-400"
                >
                  baneado
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  activo
                </Badge>
              )}
            </TableCell>

            <TableCell>{formatDateTime(user.createdAt)}</TableCell>

            {isAdmin && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Cambiar rol"
                    onClick={() => onChangeRole(user)}
                  >
                    <ShieldCheck />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={user.banned ? 'Desbanear' : 'Banear'}
                    onClick={() => onToggleBan(user)}
                  >
                    {user.banned ? <Unlock /> : <Ban />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    title="Eliminar"
                    disabled={user.id === currentUserId}
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
