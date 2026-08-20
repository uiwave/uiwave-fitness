import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ban, Plus, ShieldCheck, Trash2, Unlock } from "lucide-react";
import { toast } from "sonner";

import { usePaginated } from "@/hooks/usePaginated";
import { del, errorMessage, patch, post } from "@/lib/apiClient";
import type {
  BanResponse,
  Envelope,
  RoleUpdateResponse,
  User,
  UserRole,
} from "@/types/api";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/auth/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ErrorAlert,
  LoadingRows,
  EmptyState,
} from "@/components/shared/DataState";
import { PageHeader, PaginationBar } from "@/components/shared/PageParts";
import { StatusBadge } from "@/components/shared/StatusBadge";

const ROLES: UserRole[] = ["admin", "trainer", "receptionist", "member"];

const createUserSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(100),
  role: z.enum(["admin", "trainer", "receptionist", "member"]),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "member" },
  });

  const onSubmit = async (values: CreateUserValues) => {
    setSubmitting(true);
    try {
      await post<Envelope<User>>("/users", values);
      toast.success("Usuario creado");
      onSuccess();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="juan@test.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creando..." : "Crear usuario"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === "admin";
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
  } = usePaginated<User>("/users");

  const [createOpen, setCreateOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [roleValue, setRoleValue] = useState<UserRole>("member");
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
      toast.success("Rol actualizado");
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
        toast.success("Usuario desbaneado");
      } else {
        await patch<Envelope<BanResponse>>(`/users/${user.id}/ban`);
        toast.success("Usuario baneado");
      }
      setBanUser(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      await del(`/users/${deleteUser.id}`);
      toast.success("Usuario eliminado");
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
        <Label className="text-sm text-muted-foreground">Rol</Label>
        <Select
          value={(filters.role as string) ?? ""}
          onValueChange={(v) => setFilter("role", v === "all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
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
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
            {data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name}
                  {user.id === me?.id && (
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
                        onClick={() => {
                          setRoleUser(user);
                          setRoleValue(user.role);
                        }}
                      >
                        <ShieldCheck />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={user.banned ? "Desbanear" : "Banear"}
                        onClick={() => setBanUser(user)}
                      >
                        {user.banned ? <Unlock /> : <Ban />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        title="Eliminar"
                        disabled={user.id === me?.id}
                        onClick={() => setDeleteUser(user)}
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
          <CreateUserForm onSuccess={() => setCreateOpen(false)} />
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
              <SelectContent>
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
                {actionLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!banUser}
        onOpenChange={(open) => !open && setBanUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banUser?.banned
                ? `¿Desbanear a ${banUser?.name}?`
                : `¿Banear a ${banUser?.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banUser?.banned
                ? "El usuario podrá volver a iniciar sesión."
                : "El usuario no podrá iniciar sesión hasta que sea desbaneado."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              disabled={actionLoading}
              onClick={() => banUser && toggleBan(banUser)}
            >
              {actionLoading ? "Procesando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {deleteUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la cuenta y sus sesiones. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              disabled={actionLoading}
              onClick={confirmDelete}
            >
              {actionLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
