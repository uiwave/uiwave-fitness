import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { usePaginated } from '@/hooks/usePaginated';
import { del, errorMessage, patch, post } from '@/lib/apiClient';
import type { Envelope, Plan } from '@/types/api';
import { formatMoney } from '@/lib/format';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

const planSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().max(2000).optional().or(z.literal('')),
  price: z
    .string()
    .refine(
      (v) =>
        !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 99999999.99,
      'Precio inválido',
    ),
  durationDays: z
    .string()
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 3650,
      'Duración inválida (1–3650 días)',
    ),
  status: z.enum(['active', 'inactive']),
});

type PlanValues = z.infer<typeof planSchema>;

const emptyValues: PlanValues = {
  name: '',
  description: '',
  price: '0',
  durationDays: '30',
  status: 'active',
};

function PlanForm({
  plan,
  onSuccess,
  onCancel,
}: {
  plan?: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!plan;

  const form = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: plan
      ? {
          name: plan.name,
          description: plan.description ?? '',
          price: String(plan.price),
          durationDays: String(plan.duration_days),
          status: plan.status,
        }
      : emptyValues,
  });

  const onSubmit = async (values: PlanValues) => {
    setSubmitting(true);
    const body = {
      ...values,
      description: values.description || undefined,
      price: Number(values.price),
      durationDays: Number(values.durationDays),
    };
    try {
      if (isEdit) {
        await patch<Envelope<Plan>>(`/plans/${plan!.id}`, body);
        toast.success('Plan actualizado');
      } else {
        await post<Envelope<Plan>>('/plans', body);
        toast.success('Plan creado');
      }
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
                <Input placeholder="Plan Mensual" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Acceso ilimitado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (S/)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (días)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="3650" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
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
            {submitting
              ? 'Guardando...'
              : isEdit
                ? 'Guardar cambios'
                : 'Crear plan'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function PlansPage() {
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
  } = usePaginated<Plan>('/plans');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState<Plan | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setDialogOpen(true);
  };
  const onSuccess = () => {
    setDialogOpen(false);
    reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await del(`/plans/${deleting.id}`);
      toast.success('Plan eliminado');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Planes" description="Planes y membresías del negocio">
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus />
            Nuevo plan
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Label className="text-muted-foreground text-sm">Estado</Label>
        <Select
          value={(filters.status as string) ?? ''}
          onValueChange={(v) =>
            setFilter('status', v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">active</SelectItem>
            <SelectItem value="inactive">inactive</SelectItem>
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
              <TableHead>Precio</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              {isAdmin && (
                <TableHead className="w-24 text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
            {data.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{formatMoney(plan.price)}</TableCell>
                <TableCell>{plan.duration_days} días</TableCell>
                <TableCell>
                  <StatusBadge status={plan.status} />
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(plan)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => setDeleting(plan)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar plan' : 'Nuevo plan'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza los datos del plan.'
                : 'Crea un nuevo plan de membresía.'}
            </DialogDescription>
          </DialogHeader>
          <PlanForm
            plan={editing ?? undefined}
            onSuccess={onSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar el plan "{deleting?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              disabled={deletingLoading}
              onClick={confirmDelete}
            >
              {deletingLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
