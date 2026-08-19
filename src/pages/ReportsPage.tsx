import { useEffect, useState } from 'react'

import { get, errorMessage } from '@/lib/apiClient'
import type {
  AttendanceReport,
  Envelope,
  MembersReport,
  MembershipsReport,
  RevenueReport,
} from '@/types/api'
import { formatDate, formatMoney } from '@/lib/format'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ErrorAlert, LoadingRows } from '@/components/shared/DataState'
import { PageHeader } from '@/components/shared/PageParts'
import {
  AttendanceAreaChart,
  ChartCard,
  MembersLineChart,
  MethodBarChart,
  RevenueBarChart,
  StatusPieChart,
} from '@/components/reports/ReportCharts'

export default function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [revenue, setRevenue] = useState<RevenueReport | null>(null)
  const [members, setMembers] = useState<MembersReport | null>(null)
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null)
  const [memberships, setMemberships] = useState<MembershipsReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    const query = { from: from || undefined, to: to || undefined }
    Promise.all([
      get<Envelope<RevenueReport>>('/reports/revenue', query),
      get<Envelope<MembersReport>>('/reports/members', query),
      get<Envelope<AttendanceReport>>('/reports/attendance', query),
      get<Envelope<MembershipsReport>>('/reports/memberships'),
    ])
      .then(([revenueResult, membersResult, attendanceResult, membershipsResult]) => {
        setRevenue(revenueResult.data)
        setMembers(membersResult.data)
        setAttendance(attendanceResult.data)
        setMemberships(membershipsResult.data)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const applyFilters = () => {
    load()
  }

  if (loading) return <LoadingRows rows={8} />

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" description="Métricas del gimnasio">
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          </div>
          <Button onClick={applyFilters}>Aplicar filtros</Button>
        </div>
      </PageHeader>

      {error && <ErrorAlert message={error} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Ingresos por mes" description={`Total: ${formatMoney(revenue?.totalRevenue ?? 0)}`}>
          <RevenueBarChart data={revenue?.byMonth ?? []} />
        </ChartCard>
        <ChartCard title="Ingresos por método de pago">
          <MethodBarChart data={revenue?.byMethod ?? []} />
        </ChartCard>
        <ChartCard title="Nuevos miembros por mes (últimos 12 meses)">
          <MembersLineChart data={members?.newPerMonth ?? []} />
        </ChartCard>
        <ChartCard
          title="Asistencia diaria"
          description={`Promedio por día: ${attendance?.averagePerDay ?? 0}`}
        >
          <AttendanceAreaChart data={attendance?.daily ?? []} />
        </ChartCard>
        <ChartCard title="Membresías por estado">
          <StatusPieChart data={memberships?.byStatus ?? []} />
        </ChartCard>
      </div>

      {memberships && memberships.expiringSoonList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Membresías próximas a vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Fecha de fin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.expiringSoonList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.member_name}</TableCell>
                    <TableCell>{formatDate(item.end_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {members && members.byStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Miembros por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.byStatus.map((item) => (
                  <TableRow key={item.status}>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}