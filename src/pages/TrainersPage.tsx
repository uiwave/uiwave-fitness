import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { usePaginated } from '@/hooks/usePaginated'
import { del, errorMessage, get, patch, post } from '@/lib/apiClient'
import type { Envelope, Paginated, Trainer, User } from '@/types/api'
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

const trainerSchema = z.object({
  userId: z.string().min(1, 'Selecciona un usuario').optional().or(z.literal('')),
  specialization: z.string().max(100).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
})

type TrainerValues = z.infer<typeof trainerSchema>

function TrainerForm({
  trainer,
  isAdmin,
  onSuccess,
  onCancel,
}: {
  trainer?: Trainer
  isAdmin: boolean
  onSuccess: () => void
  onCancel: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const isEdit = !!trainer

  const form = useForm<TrainerValues>({
    resolver: zodResolver(trainerSchema),
    defaultValues: trainer
      ? {
          userId: trainer.user_id,
          specialization: trainer.specialization ?? '',
          phone: trainer.phone ?? '',
          bio: trainer.bio ?? '',
          status: trainer.status,
        }
      : { userId: '', specialization: '', phone: '', bio: '', status: 'active' },
  })

  useEffect(() => {
    get<Paginated<User>>('/users', { page: 1, limit: 100, role: 'trainer' })
      .then((result) => setUsers(result.data))
      .catch(() => setUsers([]))
  }, [])

  const onSubmit = async (values: TrainerValues) => {
    setSubmitting(true)
    const body: Record<string, unknown> = {
      userId: values.userId || undefined,
      specialization: values.specialization || undefined,
      phone: values.phone || undefined,
      bio: values.bio || undefined,
      status: values.status,
    }
    try {
      if (isEdit) {
        await patch<Envelope<Trainer>>(`/trainers/${trainer!.id}`, body)
        toast.success('Entrenador actualizado')
      } else {
        await post<Envelope<Trainer>>('/trainers', body)
        toast.success('Entrenador creado')
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
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un usuario con rol trainer" />
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialización</FormLabel>
                <FormControl>
                  <Input placeholder="Musculación" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="999888777" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Input placeholder="Entrenador certificado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear entrenador'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function TrainersPage() {
  const { user: me } = useAuth()
  const isAdmin = me?.role === 'admin'
  const { data, meta, loading, error, page, setPage, search, setSearch, filters, setFilter, reload } =
    usePaginated<Trainer>('/trainers')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Trainer | null>(null)
  const [deleting, setDeleting] = useState<Trainer | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (trainer: Trainer) => {
    setEditing(trainer)
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
      await del(`/trainers/${deleting.id}`)
      toast.success('Entrenador eliminado')
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
      <PageHeader title="Entrenadores" description="Perfiles profesionales de los entrenadores">
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus />
            Nuevo entrenador
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
        <Label className="text-sm text-muted-foreground">Estado</Label>
        <Select
          value={(filters.status as string) ?? ''}
          onValueChange={(v) => setFilter('status', v === 'all' ? undefined : v)}
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
              <TableHead>Email</TableHead>
              <TableHead>Especialización</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
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
            {data.map((trainer) => {
              const canEdit = isAdmin || trainer.user_id === me?.id
              return (
                <TableRow key={trainer.id}>
                  <TableCell className="font-medium">{trainer.user_name}</TableCell>
                  <TableCell>{trainer.user_email}</TableCell>
                  <TableCell>{trainer.specialization ?? '—'}</TableCell>
                  <TableCell>{trainer.phone ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={trainer.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={canEdit ? 'Editar' : 'Solo admin o el propio entrenador'}
                        disabled={!canEdit}
                        onClick={() => openEdit(trainer)}
                      >
                        <Pencil />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          onClick={() => setDeleting(trainer)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      <PaginationBar page={page} limit={meta.limit} total={meta.total} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar entrenador' : 'Nuevo entrenador'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Actualiza los datos del entrenador.' : 'Registra un perfil de entrenador.'}
            </DialogDescription>
          </DialogHeader>
          <TrainerForm
            trainer={editing ?? undefined}
            isAdmin={isAdmin}
            onSuccess={onSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {deleting?.user_name}?</AlertDialogTitle>
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