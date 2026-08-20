import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { usePaginated } from '@/hooks/usePaginated';
import { del, errorMessage, get, patch, post } from '@/lib/apiClient';
import type {
  Envelope,
  Exercise,
  Member,
  Paginated,
  Routine,
  RoutineExercise,
  RoutineStatus,
} from '@/types/api';
import { formatDate } from '@/lib/format';
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

const STATUSES: RoutineStatus[] = ['ACTIVE', 'INACTIVE', 'COMPLETED'];

const routineSchema = z
  .object({
    memberId: z.string().min(1, 'Selecciona un miembro'),
    name: z.string().min(1, 'El nombre es obligatorio').max(150),
    description: z.string().max(2000).optional().or(z.literal('')),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED']),
  })
  .superRefine((values, ctx) => {
    if (
      values.startDate &&
      values.endDate &&
      values.endDate < values.startDate
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'endDate debe ser mayor o igual a startDate',
      });
    }
  });

type RoutineValues = z.infer<typeof routineSchema>;

const routineExerciseSchema = z.object({
  exerciseId: z.string().min(1, 'Selecciona un ejercicio'),
  sets: z
    .string()
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 1000,
      'Series inválidas',
    ),
  repetitions: z
    .string()
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 1000,
      'Repeticiones inválidas',
    ),
  weight: z
    .string()
    .refine(
      (v) =>
        !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 99999999.99,
      'Peso inválido',
    ),
  restSeconds: z
    .string()
    .refine(
      (v) =>
        Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 86400,
      'Descanso inválido',
    ),
  notes: z.string().max(1000).optional().or(z.literal('')),
  orderIndex: z
    .string()
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
      'Orden inválido',
    ),
});

type RoutineExerciseValues = z.infer<typeof routineExerciseSchema>;

function RoutineForm({
  routine,
  onSuccess,
  onCancel,
}: {
  routine?: Routine;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const isEdit = !!routine;

  const form = useForm<RoutineValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: routine
      ? {
          memberId: routine.member_id,
          name: routine.name,
          description: routine.description ?? '',
          startDate: routine.start_date ?? '',
          endDate: routine.end_date ?? '',
          status: routine.status,
        }
      : {
          memberId: '',
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          status: 'ACTIVE',
        },
  });

  useEffect(() => {
    get<Paginated<Member>>('/members', { page: 1, limit: 100 })
      .then((result) => setMembers(result.data))
      .catch(() => setMembers([]));
  }, []);

  const onSubmit = async (values: RoutineValues) => {
    setSubmitting(true);
    const body: Record<string, unknown> = {
      memberId: values.memberId,
      name: values.name,
      description: values.description || undefined,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      status: values.status,
    };
    try {
      if (isEdit) {
        await patch<Envelope<Routine>>(`/routines/${routine!.id}`, body);
        toast.success('Rutina actualizada');
      } else {
        await post<Envelope<Routine>>('/routines', body);
        toast.success('Rutina creada');
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
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Miembro</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un miembro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user_name ?? member.document_number ?? member.id}
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Rutina Fuerza" {...field} />
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
                <Input placeholder="4 semanas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
            {submitting
              ? 'Guardando...'
              : isEdit
                ? 'Guardar cambios'
                : 'Crear rutina'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function RoutineExerciseForm({
  routineId,
  exercise,
  onSuccess,
  onCancel,
}: {
  routineId: string;
  exercise?: RoutineExercise;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const isEdit = !!exercise;

  const form = useForm<RoutineExerciseValues>({
    resolver: zodResolver(routineExerciseSchema),
    defaultValues: exercise
      ? {
          exerciseId: exercise.exercise_id,
          sets: String(exercise.sets),
          repetitions: String(exercise.repetitions),
          weight: String(exercise.weight),
          restSeconds: String(exercise.rest_seconds),
          notes: exercise.notes ?? '',
          orderIndex: String(exercise.order_index),
        }
      : {
          exerciseId: '',
          sets: '4',
          repetitions: '10',
          weight: '0',
          restSeconds: '60',
          notes: '',
          orderIndex: '0',
        },
  });

  useEffect(() => {
    get<Paginated<Exercise>>('/exercises', { page: 1, limit: 100 })
      .then((result) => setExercises(result.data))
      .catch(() => setExercises([]));
  }, []);

  const onSubmit = async (values: RoutineExerciseValues) => {
    setSubmitting(true);
    const body: Record<string, unknown> = {
      exerciseId: values.exerciseId,
      sets: Number(values.sets),
      repetitions: Number(values.repetitions),
      weight: Number(values.weight),
      restSeconds: Number(values.restSeconds),
      notes: values.notes || undefined,
      orderIndex: Number(values.orderIndex),
    };
    try {
      if (isEdit) {
        await patch<Envelope<RoutineExercise>>(
          `/routines/${routineId}/exercises/${exercise!.id}`,
          body,
        );
        toast.success('Ejercicio de rutina actualizado');
      } else {
        await post<Envelope<RoutineExercise>>(
          `/routines/${routineId}/exercises`,
          body,
        );
        toast.success('Ejercicio agregado a la rutina');
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
          name="exerciseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ejercicio</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un ejercicio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Series</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repetitions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeticiones</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="restSeconds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descanso (seg)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="86400" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="orderIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Input placeholder="Subir peso progresivo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? 'Guardando...'
              : isEdit
                ? 'Guardar cambios'
                : 'Agregar'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function RoutineExercisesDialog({
  routine,
  canManage,
  onClose,
}: {
  routine: Routine;
  canManage: boolean;
  onClose: () => void;
}) {
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoutineExercise | null>(null);
  const [deleting, setDeleting] = useState<RoutineExercise | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    get<Envelope<RoutineExercise[]>>(`/routines/${routine.id}/exercises`)
      .then((result) => setExercises(result.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [routine.id]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await del(`/routines/${routine.id}/exercises/${deleting.id}`);
      toast.success('Ejercicio eliminado de la rutina');
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ejercicios de "{routine.name}"</DialogTitle>
          <DialogDescription>
            {routine.member_name} · {routine.trainer_name}
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorAlert message={error} />}
        {loading ? (
          <LoadingRows />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Ejercicio</TableHead>
                <TableHead>Series × Reps</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Descanso</TableHead>
                {canManage && (
                  <TableHead className="w-20 text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 5}>
                    <EmptyState message="Sin ejercicios en esta rutina" />
                  </TableCell>
                </TableRow>
              )}
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell>{exercise.order_index}</TableCell>
                  <TableCell className="font-medium">
                    {exercise.exercise_name}
                  </TableCell>
                  <TableCell>
                    {exercise.sets} × {exercise.repetitions}
                  </TableCell>
                  <TableCell>{exercise.weight} kg</TableCell>
                  <TableCell>{exercise.rest_seconds}s</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditing(exercise);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          onClick={() => setDeleting(exercise)}
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

        {canManage && (
          <DialogFooter>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              Agregar ejercicio
            </Button>
          </DialogFooter>
        )}

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Editar ejercicio' : 'Agregar ejercicio'}
              </DialogTitle>
            </DialogHeader>
            <RoutineExerciseForm
              routineId={routine.id}
              exercise={editing ?? undefined}
              onSuccess={() => {
                setFormOpen(false);
                load();
              }}
              onCancel={() => setFormOpen(false)}
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
                ¿Quitar este ejercicio de la rutina?
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
      </DialogContent>
    </Dialog>
  );
}

export default function RoutinesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canManage = isAdmin || user?.role === 'trainer';
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
  } = usePaginated<Routine>('/routines');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [viewing, setViewing] = useState<Routine | null>(null);
  const [deleting, setDeleting] = useState<Routine | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (routine: Routine) => {
    setEditing(routine);
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
      await del(`/routines/${deleting.id}`);
      toast.success('Rutina eliminada');
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
      <PageHeader
        title="Rutinas"
        description="Rutinas de entrenamiento asignadas a miembros"
      >
        {canManage && (
          <Button onClick={openCreate}>
            <Plus />
            Nueva rutina
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
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
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
              <TableHead>Miembro</TableHead>
              <TableHead>Entrenador</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-28 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
            {data.map((routine) => (
              <TableRow key={routine.id}>
                <TableCell className="font-medium">{routine.name}</TableCell>
                <TableCell>{routine.member_name}</TableCell>
                <TableCell>{routine.trainer_name}</TableCell>
                <TableCell>{formatDate(routine.start_date)}</TableCell>
                <TableCell>{formatDate(routine.end_date)}</TableCell>
                <TableCell>
                  <StatusBadge status={routine.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setViewing(routine)}
                    >
                      <Eye />
                    </Button>
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(routine)}
                        >
                          <Pencil />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() => setDeleting(routine)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </>
                    )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar rutina' : 'Nueva rutina'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza los datos de la rutina.'
                : 'Asigna una rutina a un miembro.'}
            </DialogDescription>
          </DialogHeader>
          <RoutineForm
            routine={editing ?? undefined}
            onSuccess={onSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {viewing && (
        <RoutineExercisesDialog
          routine={viewing}
          canManage={canManage}
          onClose={() => setViewing(null)}
        />
      )}

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar la rutina "{deleting?.name}"?
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
