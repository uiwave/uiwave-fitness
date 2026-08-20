import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, CheckCheck, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { usePaginated } from '@/hooks/usePaginated';
import { del, errorMessage, get, patch, post } from '@/lib/apiClient';
import type {
  Envelope,
  Notification,
  NotificationMeta,
  NotificationType,
  Paginated,
  UpdatedCountResponse,
  User,
} from '@/types/api';
import { formatDateTime } from '@/lib/format';
import { useAuth } from '@/auth/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  ErrorAlert,
  LoadingRows,
  EmptyState,
} from '@/components/shared/DataState';
import { PageHeader, PaginationBar } from '@/components/shared/PageParts';
import { StatusBadge } from '@/components/shared/StatusBadge';

const TYPES: NotificationType[] = [
  'INFO',
  'WARNING',
  'SUCCESS',
  'PAYMENT',
  'MEMBERSHIP',
  'SYSTEM',
];

const notificationSchema = z.object({
  userId: z.string().min(1, 'Selecciona un usuario'),
  title: z.string().min(1, 'El título es obligatorio').max(200),
  message: z.string().min(1, 'El mensaje es obligatorio').max(4000),
  type: z.enum([
    'INFO',
    'WARNING',
    'SUCCESS',
    'PAYMENT',
    'MEMBERSHIP',
    'SYSTEM',
  ]),
});

type NotificationValues = z.infer<typeof notificationSchema>;

function CreateNotificationForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const form = useForm<NotificationValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: { userId: '', title: '', message: '', type: 'INFO' },
  });

  useEffect(() => {
    get<Paginated<User>>('/users', { page: 1, limit: 100 })
      .then((result) => setUsers(result.data))
      .catch(() => setUsers([]));
  }, []);

  const onSubmit = async (values: NotificationValues) => {
    setSubmitting(true);
    try {
      await post<Envelope<Notification>>('/notifications', values);
      toast.success('Notificación creada');
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
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Bienvenido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Input placeholder="Gracias por unirte" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear notificación'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const {
    data,
    meta,
    loading,
    error,
    page,
    setPage,
    filters,
    setFilter,
    reload,
  } = usePaginated<Notification, NotificationMeta>('/notifications');

  const [createOpen, setCreateOpen] = useState(false);
  const [acting, setActing] = useState(false);

  const markRead = async (id: string) => {
    setActing(true);
    try {
      await patch<Envelope<Notification>>(`/notifications/${id}/read`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const markAllRead = async () => {
    setActing(true);
    try {
      const { data: result } = await patch<Envelope<UpdatedCountResponse>>(
        '/notifications/read-all',
      );
      toast.success(`${result.updated} notificaciones marcadas como leídas`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const remove = async (id: string) => {
    setActing(true);
    try {
      await del(`/notifications/${id}`);
      toast.success('Notificación eliminada');
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notificaciones"
        description="Solo puedes ver tus propias notificaciones"
      >
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Nueva notificación
          </Button>
        )}
        <Button variant="outline" onClick={markAllRead} disabled={acting}>
          <CheckCheck />
          Marcar todas como leídas
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Label className="text-muted-foreground text-sm">Leídas</Label>
        <Select
          value={(filters.read as string) ?? ''}
          onValueChange={(v) => setFilter('read', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="true">Leídas</SelectItem>
            <SelectItem value="false">No leídas</SelectItem>
          </SelectContent>
        </Select>
        <Label className="text-muted-foreground text-sm">Tipo</Label>
        <Select
          value={(filters.type as string) ?? ''}
          onValueChange={(v) => setFilter('type', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label className="text-muted-foreground text-sm">
          {meta.unread} sin leer
        </Label>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading ? (
        <LoadingRows />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
            {data.map((notification) => (
              <TableRow
                key={notification.id}
                className={notification.read ? '' : 'bg-muted/40'}
              >
                <TableCell className="font-medium">
                  {notification.title}
                </TableCell>
                <TableCell>{notification.message}</TableCell>
                <TableCell>
                  <StatusBadge status={notification.type} />
                </TableCell>
                <TableCell>
                  {notification.read ? 'leída' : 'no leída'}
                </TableCell>
                <TableCell>{formatDateTime(notification.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Marcar como leída"
                        disabled={acting}
                        onClick={() => markRead(notification.id)}
                      >
                        <Check />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      title="Eliminar"
                      disabled={acting}
                      onClick={() => remove(notification.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
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
            <DialogTitle>Nueva notificación</DialogTitle>
            <DialogDescription>
              Envía una notificación manual a un usuario.
            </DialogDescription>
          </DialogHeader>
          <CreateNotificationForm
            onSuccess={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
