import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { usePaginated } from '@/hooks/usePaginated';
import { del, errorMessage, patch } from '@/lib/apiClient';
import type {
  BanResponse,
  Envelope,
  RoleUpdateResponse,
  User,
  UserRole,
} from '@/types/api';
import { useAuth } from '@/auth/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ErrorAlert, LoadingRows } from '@/components/shared/DataState';
import { PageHeader, PaginationBar } from '@/components/shared/PageParts';
import { UsersTable } from '@/features/users/ui/UsersTable';
import { CreateUserForm } from '@/features/users/ui/CreateUserForm';
import { ConfirmDialog } from '@/features/shared/ui/ConfirmDialog';

const ROLES: UserRole[] = ['admin', 'trainer', 'receptionist', 'member'];

export default function UsersPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';
  const {
    data,
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    reload,
  } = usePaginated<User>('/users');

  const [createOpen, setCreateOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [roleValue, setRoleValue] = useState<UserRole>('member');
  const [banUser, setBanUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const changeRole = async () => {
    if (!roleUser) return;
    setActionLoading(true);
    try {
      await patch<Envelope<RoleUpdateResponse>>(`/users/${roleUser.id}/role`, {
        role: roleValue,
      });
      toast.success('Rol actualizado');
      setRoleUser(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBan = async (user: User) => {
    setActionLoading(true);
    try {
      if (user.banned) {
        await patch<Envelope<BanResponse>>(`/users/${user.id}/unban`);
        toast.success('Usuario desbaneado');
      } else {
        await patch<Envelope<BanResponse>>(`/users/${user.id}/ban`);
        toast.success('Usuario baneado');
      }
      setBanUser(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      await del(`/users/${deleteUser.id}`);
      toast.success('Usuario eliminado');
      setDeleteUser(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Cuentas del sistema (Better Auth)"
      >
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Nuevo usuario
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="max-w-xs"
        />
        <Label className="text-muted-foreground text-sm">Rol</Label>
        <Select
          value={(filters.role as string) ?? ''}
          onValueChange={(v) => setFilter('role', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start">
            <SelectItem value="all">Todos</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading ? (
        <LoadingRows />
      ) : (
        <UsersTable
          users={data}
          currentUserId={me?.id}
          isAdmin={isAdmin}
          onChangeRole={(user) => {
            setRoleUser(user);
            setRoleValue(user.role);
          }}
          onToggleBan={(user) => {
            setBanUser(user);
          }}
          onDelete={(user) => {
            setDeleteUser(user);
          }}
        />
      )}
      <PaginationBar
        page={page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={setPage}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Crea una cuenta para un miembro del staff.
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm
            onSuccess={() => {
              setCreateOpen(false);
              reload();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!roleUser}
        onOpenChange={(open) => !open && setRoleUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar rol de {roleUser?.name}</DialogTitle>
            <DialogDescription>
              El rol determina los permisos del usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Rol</Label>
            <Select
              value={roleValue}
              onValueChange={(v) => setRoleValue(v as UserRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" align="start">
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleUser(null)}>
                Cancelar
              </Button>
              <Button onClick={changeRole} disabled={actionLoading}>
                {actionLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!banUser}
        onOpenChange={(open) => !open && setBanUser(null)}
        title={
          banUser?.banned
            ? `¿Desbanear a ${banUser?.name}?`
            : `¿Banear a ${banUser?.name}?`
        }
        description={
          banUser?.banned
            ? 'El usuario podrá volver a iniciar sesión.'
            : 'El usuario no podrá iniciar sesión hasta que sea desbaneado.'
        }
        confirmText="Confirmar"
        loadingText="Procesando..."
        loading={actionLoading}
        onConfirm={() => banUser && toggleBan(banUser)}
      />

      <ConfirmDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        title={`¿Eliminar a ${deleteUser?.name}?`}
        description="Se eliminará la cuenta y sus sesiones. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loadingText="Eliminando..."
        loading={actionLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
