import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { usePaginated } from '@/hooks/usePaginated'
import { del, errorMessage, get, patch, post } from '@/lib/apiClient'
import type { Envelope, Member, Paginated, User } from '@/types/api'
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

const memberSchema = z.object({
  userId: z.string().optional().or(z.literal('')),
  documentNumber: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  emergencyContactName: z.string().max(100).optional().or(z.literal('')),
  emergencyContactPhone: z.string().max(20).optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'suspended']),
})

type MemberValues = z.infer<typeof memberSchema>

function emptyValues(): MemberValues {
  return {
    userId: '',
    documentNumber: '',
    phone: '',
    birthDate: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    status: 'active',
  }
}

function MemberForm({
  member,
  onSuccess,
  onCancel,
}: {
  member?: Member
  onSuccess: () => void
  onCancel: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const isEdit = !!member

  const form = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          userId: member.user_id ?? '',
          documentNumber: member.document_number ?? '',
          phone: member.phone ?? '',
          birthDate: member.birth_date ?? '',
          address: member.address ?? '',
          emergencyContactName: member.emergency_contact_name ?? '',
          emergencyContactPhone: member.emergency_contact_phone ?? '',
          status: member.status,
        }
      : emptyValues(),
  })

  useEffect(() => {
    get<Paginated<User>>('/users', { page: 1, limit: 100 })
      .then((result) => setUsers(result.data))
      .catch(() => setUsers([]))
  }, [])

  const onSubmit = async (values: MemberValues) => {
    setSubmitting(true)
    const body: Record<string, unknown> = {
      userId: values.userId || undefined,
      documentNumber: values.documentNumber || undefined,
      phone: values.phone || undefined,
      birthDate: values.birthDate || undefined,
      address: values.address || undefined,
      emergencyContactName: values.emergencyContactName || undefined,
      emergencyContactPhone: values.emergencyContactPhone || undefined,
      status: values.status,
    }
    try {
      if (isEdit) {
        await patch<Envelope<Member>>(`/members/${member!.id}`, body)
        toast.success('Miembro actualizado')
      } else {
        await post<Envelope<Member>>('/members', body)
        toast.success('Miembro creado')
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
              <FormLabel>Usuario vinculado</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin usuario" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Sin usuario</SelectItem>
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
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
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
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de nacimiento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Av. Lima 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacto de emergencia</FormLabel>
                <FormControl>
                  <Input placeholder="María Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono de emergencia</FormLabel>
                <FormControl>
                  <Input placeholder="988777666" {...field} />
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
                  <SelectItem value="suspended">suspended</SelectItem>
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
            {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear miembro'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function MembersPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'admin' || user?.role === 'receptionist'
  const { data, meta, loading, error, page, setPage, search, setSearch, filters, setFilter, reload } =
    usePaginated<Member>('/members')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState<Member | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (member: Member) => {
    setEditing(member)
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
      await del(`/members/${deleting.id}`)
      toast.success('Miembro eliminado')
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
      <PageHeader title="Miembros" description="Gestiona los miembros del gimnasio">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus />
            Nuevo miembro
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, documento, teléfono..."
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
            <SelectItem value="suspended">suspended</SelectItem>
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
              <TableHead>Documento</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              {canManage && <TableHead className="w-24 text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 6 : 5}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
            {data.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.user_name ?? 'Sin usuario'}</TableCell>
                <TableCell>{member.user_email ?? '—'}</TableCell>
                <TableCell>{member.document_number ?? '—'}</TableCell>
                <TableCell>{member.phone ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={member.status} />
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(member)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => setDeleting(member)}
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
      <PaginationBar page={page} limit={meta.limit} total={meta.total} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar miembro' : 'Nuevo miembro'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza los datos del miembro.'
                : 'Registra un nuevo miembro del gimnasio.'}
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            member={editing ?? undefined}
            onSuccess={onSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar a {deleting?.user_name ?? 'este miembro'}?
            </AlertDialogTitle>
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