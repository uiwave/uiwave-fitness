import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { usePaginated } from '@/hooks/usePaginated'
import { errorMessage, get, patch, post } from '@/lib/apiClient'
import type {
  Envelope,
  Membership,
  Member,
  Paginated,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '@/types/api'
import { formatDateTime, formatMoney } from '@/lib/format'

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

const STATUSES: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
const METHODS: PaymentMethod[] = ['CASH', 'CARD', 'TRANSFER', 'YAPE', 'PLIN', 'OTHER']

const paymentSchema = z.object({
  memberId: z.string().min(1, 'Selecciona un miembro'),
  membershipId: z.string().optional().or(z.literal('')),
  amount: z
    .string()
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0.01, 'Monto inválido (mínimo 0.01)'),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER', 'YAPE', 'PLIN', 'OTHER']),
  paymentDate: z.string().optional().or(z.literal('')),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  reference: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

type PaymentValues = z.infer<typeof paymentSchema>

function PaymentForm({
  payment,
  onSuccess,
  onCancel,
}: {
  payment?: Payment
  onSuccess: () => void
  onCancel: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const isEdit = !!payment

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: payment
      ? {
          memberId: payment.member_id,
          membershipId: payment.membership_id ?? '',
          amount: String(payment.amount),
          paymentMethod: payment.payment_method,
          paymentDate: payment.payment_date?.slice(0, 10) ?? '',
          status: payment.status,
          reference: payment.reference ?? '',
          notes: payment.notes ?? '',
        }
      : {
          memberId: '',
          membershipId: '',
          amount: '',
          paymentMethod: 'YAPE',
          paymentDate: '',
          status: 'PENDING',
          reference: '',
          notes: '',
        },
  })

  const selectedMemberId = form.watch('memberId')

  useEffect(() => {
    get<Paginated<Member>>('/members', { page: 1, limit: 100 })
      .then((result) => setMembers(result.data))
      .catch(() => setMembers([]))
  }, [])

  useEffect(() => {
    if (!selectedMemberId) {
      setMemberships([])
      return
    }
    get<Envelope<Membership[]>>(`/members/${selectedMemberId}/memberships`)
      .then((result) => setMemberships(result.data))
      .catch(() => setMemberships([]))
  }, [selectedMemberId])

  const onSubmit = async (values: PaymentValues) => {
    setSubmitting(true)
    const body: Record<string, unknown> = {
      memberId: values.memberId,
      membershipId: values.membershipId || undefined,
      amount: Number(values.amount),
      paymentMethod: values.paymentMethod,
      paymentDate: values.paymentDate || undefined,
      status: values.status,
      reference: values.reference || undefined,
      notes: values.notes || undefined,
    }
    try {
      if (isEdit) {
        await patch<Envelope<Payment>>(`/payments/${payment!.id}`, body)
        toast.success('Pago actualizado')
      } else {
        await post<Envelope<Payment>>('/payments', body)
        toast.success('Pago registrado')
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
          name="membershipId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Membresía (opcional)</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedMemberId ? 'Selecciona una membresía' : 'Primero elige un miembro'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Sin membresía</SelectItem>
                  {memberships.map((membership) => (
                    <SelectItem key={membership.id} value={membership.id}>
                      {membership.plan_name} ({membership.status})
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto (S/)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01" placeholder="89.90" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de pago</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de pago</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia</FormLabel>
              <FormControl>
                <Input placeholder="YAPE-12345" {...field} />
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
                <Input placeholder="Pago de agosto" {...field} />
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
            {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar pago'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function PaymentsPage() {
  const { data, meta, loading, error, page, setPage, filters, setFilter, reload } =
    usePaginated<Payment>('/payments')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (payment: Payment) => {
    setEditing(payment)
    setDialogOpen(true)
  }
  const onSuccess = () => {
    setDialogOpen(false)
    reload()
  }

  return (
    <div>
      <PageHeader title="Pagos" description="Pagos de los miembros">
        <Button onClick={openCreate}>
          <Plus />
          Registrar pago
        </Button>
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
        <Input
          type="date"
          value={(filters.from as string) ?? ''}
          onChange={(e) => setFilter('from', e.target.value)}
          className="w-40"
          aria-label="Desde"
        />
        <Input
          type="date"
          value={(filters.to as string) ?? ''}
          onChange={(e) => setFilter('to', e.target.value)}
          className="w-40"
          aria-label="Hasta"
        />
      </div>

      {error && <ErrorAlert message={error} />}
      {loading ? (
        <LoadingRows />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-16 text-right">Acciones</TableHead>
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
            {data.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.member_name}</TableCell>
                <TableCell>{formatMoney(payment.amount)}</TableCell>
                <TableCell>{payment.payment_method}</TableCell>
                <TableCell>{formatDateTime(payment.payment_date)}</TableCell>
                <TableCell>{payment.reference ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(payment)}>
                    <Pencil />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <PaginationBar page={page} limit={meta.limit} total={meta.total} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar pago' : 'Registrar pago'}</DialogTitle>
            <DialogDescription>
              Un pago con estado COMPLETED activa la membresía asociada automáticamente.
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            payment={editing ?? undefined}
            onSuccess={onSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}