import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { usePaginated } from '@/hooks/usePaginated'
import { del, errorMessage, patch, post } from '@/lib/apiClient'
import type { Difficulty, Envelope, Exercise } from '@/types/api'
import { useAuth } from '@/auth/AuthContext'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ErrorAlert, LoadingRows, EmptyState } from '@/components/shared/DataState'
import { PageHeader, PaginationBar } from '@/components/shared/PageParts'
import { StatusBadge } from '@/components/shared/StatusBadge'

const DIFFICULTIES: Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(150),
  description: z.string().max(2000).optional().or(z.literal('')),
  muscleGroup: z.string().max(100).optional().or(z.literal('')),
  equipment: z.string().max(100).optional().or(z.literal('')),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  instructions: z.string().max(4000).optional().or(z.literal('')),
  imageUrl: z.string().max(500).optional().or(z.literal('')),
})

type ExerciseValues = z.infer<typeof exerciseSchema>

function ExerciseForm({
  exercise,
  onSuccess,
  onCancel,
}: {
  exercise?: Exercise
  onSuccess: () => void
  onCancel: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!exercise

  const form = useForm<ExerciseValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: exercise
      ? {
          name: exercise.name,
          description: exercise.description ?? '',
          muscleGroup: exercise.muscle_group ?? '',
          equipment: exercise.equipment ?? '',
          difficulty: exercise.difficulty,
          instructions: exercise.instructions ?? '',
          imageUrl: exercise.image_url ?? '',
        }
      : {
          name: '',
          description: '',
          muscleGroup: '',
          equipment: '',
          difficulty: 'BEGINNER',
          instructions: '',
          imageUrl: '',
        },
  })

  const onSubmit = async (values: ExerciseValues) => {
    setSubmitting(true)
    const body: Record<string, unknown> = {
      name: values.name,
      description: values.description || undefined,
      muscleGroup: values.muscleGroup || undefined,
      equipment: values.equipment || undefined,
      difficulty: values.difficulty,
      instructions: values.instructions || undefined,
      imageUrl: values.imageUrl || undefined,
    }
    try {
      if (isEdit) {
        await patch<Envelope<Exercise>>(`/exercises/${exercise!.id}`, body)
        toast.success('Ejercicio actualizado')
      } else {
        await post<Envelope<Exercise>>('/exercises', body)
        toast.success('Ejercicio creado')
      }
      onSuccess()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

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
                <Input placeholder="Press de banca" {...field} />
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
                <Input placeholder="Empuje horizontal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="muscleGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo muscular</FormLabel>
                <FormControl>
                  <Input placeholder="Pecho" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="equipment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipo</FormLabel>
                <FormControl>
                  <Input placeholder="Barra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dificultad</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
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
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de imagen</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrucciones</FormLabel>
              <FormControl>
                <Input placeholder="Acuéstate sobre el banco..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear ejercicio'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function ExercisesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const canManage = isAdmin || user?.role === 'trainer'
  const { data, meta, loading, error, page, setPage, filters, setFilter, reload } =
    usePaginated<Exercise>('/exercises')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [deleting, setDeleting] = useState<Exercise | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (exercise: Exercise) => {
    setEditing(exercise)
    setDialogOpen(true)
  }
  const onSuccess = () => {
    setDialogOpen(false)
    reload()
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingLoading(true)
    try {
      await del(`/exercises/${deleting.id}`)
      toast.success('Ejercicio eliminado')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeletingLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Ejercicios" description="Catálogo de ejercicios del gimnasio">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus />
            Nuevo ejercicio
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={(filters.muscleGroup as string) ?? ''}
          onChange={(e) => setFilter('muscleGroup', e.target.value)}
          placeholder="Filtrar por grupo muscular..."
          className="max-w-xs"
        />
        <Label className="text-sm text-muted-foreground">Dificultad</Label>
        <Select
          value={(filters.difficulty as string) ?? ''}
          onValueChange={(v) => setFilter('difficulty', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {DIFFICULTIES.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty}
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
              <TableHead>Grupo muscular</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Dificultad</TableHead>
              {canManage && <TableHead className="w-24 text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
            {data.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell className="font-medium">{exercise.name}</TableCell>
                <TableCell>{exercise.muscle_group ?? '—'}</TableCell>
                <TableCell>{exercise.equipment ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={exercise.difficulty} />
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(exercise)}>
                        <Pencil />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          onClick={() => setDeleting(exercise)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <PaginationBar page={page} limit={meta.limit} total={meta.total} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar ejercicio' : 'Nuevo ejercicio'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Actualiza los datos del ejercicio.' : 'Agrega un ejercicio al catálogo.'}
            </DialogDescription>
          </DialogHeader>
          <ExerciseForm
            exercise={editing ?? undefined}
            onSuccess={onSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar el ejercicio "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLoading}>Cancelar</AlertDialogCancel>
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
  )
}