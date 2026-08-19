import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { usePaginated } from '@/hooks/usePaginated'
import { del, errorMessage, get, patch, post } from '@/lib/apiClient'
import type {
  Envelope,
  Membership,
  MembershipStatus,
  Member,
  Paginated,
  Plan,
} from '@/types/api'
import { formatDate, formatMoney } from '@/lib/format'
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

const STATUSES: MembershipStatus[] = ['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']

const membershipSchema = z
  .object({
    memberId: z.string().min(1, 'Selecciona un miembro'),
    planId: z.string().min(1, 'Selecciona un plan'),
    startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
    endDate: z.string().min(1, 'La fecha de fin es obligatoria'),
    status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']),
    price: z
      .string()
      .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Precio inválido'),
  })
  .superRefine((values, ctx) => {
    if (values.endDate < values.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'endDate debe ser mayor o igual a startDate',
      })
    }
  })

type MembershipValues = z.infer<typeof membershipSchema>

function MembershipForm({
  membership,
  onSuccess,
  onCancel,
}: {
  membership?: Membership
  onSuccess: () => void
  onCancel: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const isEdit = !!membership

  const form = useForm<MembershipValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: membership
      ? {
          memberId: membership.member_id,
          planId: membership.plan_id,
          startDate: membership.start_date,
          endDate: membership.end_date,
          status: membership.status,
          price: membership.price === 0 ? '' : String(membership.price),
        }
      : {
          memberId: '',
          planId: '',
          startDate: '',
          endDate: '',
          status: 'PENDING',
          price: '',
        },
  })

  useEffect(() => {
    Promise.all([
      get<Paginated<Member>>('/members', { page: 1, limit: 100 }),
      get<Paginated<Plan>>('/plans', { page: 1, limit: 100 }),
    ])
      .then(([membersResult, plansResult]) => {
        setMembers(membersResult.data)
        setPlans(plansResult.data)
      })
      .catch(() => {
        setMembers([])
        setPlans([])
      })
  }, [])

  const onSubmit = async (values: MembershipValues) => {
    setSubmitting(true)
    const body: Record<string, unknown> = {
      memberId: values.memberId,
      planId: values.planId,
      startDate: values.startDate,
      endDate: values.endDate,
      status: values.status,
      price: values.price === '' ? undefined : Number(values.price),
    }
    try {
      if (isEdit) {
        await patch<Envelope<Membership>>(`/memberships/${membership!.id}`, body)
        toast.success('Membresía actualizada')
      } else {
        await post<Envelope<Membership>>('/memberships', body)
        toast.success('Membresía creada')
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
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} ({formatMoney(plan.price)})
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (S/)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Usa el precio del plan"
                    {...field}
                  />
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
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear membresía'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function MembershipsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const canManage = isAdmin || user?.role === 'receptionist'
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
  } = usePaginated<Membership>('/memberships')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Membership | null>(null)
  const [deleting, setDeleting] = useState<Membership | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (membership: Membership) => {
    setEditing(membership)
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
      await del(`/memberships/${deleting.id}`)
      toast.success('Membresía eliminada')
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
      <PageHeader title="Membresías" description="Membresías activas de cada miembro">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus />
            Nueva membresía
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
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
              <TableHead>Miembro</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              {canManage && <TableHead className="w-24 text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
            {data.map((membership) => (
              <TableRow key={membership.id}>
                <TableCell className="font-medium">{membership.member_name}</TableCell>
                <TableCell>{membership.plan_name}</TableCell>
                <TableCell>{formatDate(membership.start_date)}</TableCell>
                <TableCell>{formatDate(membership.end_date)}</TableCell>
                <TableCell>{formatMoney(membership.price)}</TableCell>
                <TableCell>
                  <StatusBadge status={membership.status} />
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(membership)}>
                        <Pencil />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          onClick={() => setDeleting(membership)}
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
            <DialogTitle>{editing ? 'Editar membresía' : 'Nueva membresía'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza los datos de la membresía.'
                : 'Vincula un miembro con un plan.'}
            </DialogDescription>
          </DialogHeader>
          <MembershipForm
            membership={editing ?? undefined}
            onSuccess={onSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar la membresía de {deleting?.member_name}?</AlertDialogTitle>
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