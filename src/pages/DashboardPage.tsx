import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  CircleDollarSign,
  CreditCard,
  Dumbbell,
  Hourglass,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { get, errorMessage } from '@/lib/apiClient';
import type {
  Attendance,
  AttendanceReport,
  DashboardReport,
  Envelope,
  Member,
  Membership,
  MembershipsReport,
  MembersReport,
  Paginated,
  Payment,
  RevenueReport,
  Routine,
} from '@/types/api';
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatMoney,
} from '@/lib/format';
import { useAuth } from '@/auth/AuthContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ErrorAlert,
  LoadingRows,
  EmptyState,
} from '@/components/shared/DataState';
import { PageHeader } from '@/components/shared/PageParts';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  AttendanceAreaChart,
  ChartCard,
  MembersLineChart,
  RevenueBarChart,
  StatusPieChart,
} from '@/components/reports/ReportCharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function StaffDashboard() {
  const [dashboard, setDashboard] = useState<DashboardReport | null>(null);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null);
  const [members, setMembers] = useState<MembersReport | null>(null);
  const [memberships, setMemberships] = useState<MembershipsReport | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      get<Envelope<DashboardReport>>('/reports/dashboard'),
      get<Envelope<RevenueReport>>('/reports/revenue'),
      get<Envelope<AttendanceReport>>('/reports/attendance'),
      get<Envelope<MembersReport>>('/reports/members'),
      get<Envelope<MembershipsReport>>('/reports/memberships'),
    ])
      .then(
        ([
          dashboardResult,
          revenueResult,
          attendanceResult,
          membersResult,
          membershipsResult,
        ]) => {
          setDashboard(dashboardResult.data);
          setRevenue(revenueResult.data);
          setAttendance(attendanceResult.data);
          setMembers(membersResult.data);
          setMemberships(membershipsResult.data);
        },
      )
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingRows rows={8} />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Miembros totales"
          value={dashboard!.totalMembers}
          icon={<Users />}
        />
        <StatCard
          title="Miembros activos"
          value={dashboard!.activeMembers}
          icon={<Users />}
        />
        <StatCard
          title="Membresías activas"
          value={dashboard!.activeMemberships}
          icon={<CreditCard />}
        />
        <StatCard
          title="Membresías vencidas"
          value={dashboard!.expiredMemberships}
          icon={<Hourglass />}
        />
        <StatCard
          title="Ingresos del mes"
          value={formatMoney(dashboard!.monthlyRevenue)}
          icon={<CircleDollarSign />}
        />
        <StatCard
          title="Asistencia hoy"
          value={dashboard!.todayAttendance}
          icon={<CalendarCheck2 />}
        />
        <StatCard
          title="Pagos pendientes"
          value={dashboard!.pendingPayments}
          icon={<Wallet />}
        />
        <StatCard
          title="Próximas a vencer"
          value={memberships!.expiringSoon}
          icon={<TrendingUp />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Ingresos por mes">
          <RevenueBarChart data={revenue!.byMonth} />
        </ChartCard>
        <ChartCard title="Asistencia diaria (últimos 30 días)">
          <AttendanceAreaChart data={attendance!.daily} />
        </ChartCard>
        <ChartCard title="Nuevos miembros por mes (últimos 12 meses)">
          <MembersLineChart data={members!.newPerMonth} />
        </ChartCard>
        <ChartCard title="Membresías por estado">
          <StatusPieChart data={memberships!.byStatus} />
        </ChartCard>
      </div>

      {memberships!.expiringSoonList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Membresías por vencer
            </CardTitle>
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
                {memberships!.expiringSoonList.map((item) => (
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
    </div>
  );
}

function TrainerDashboard() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routinesTotal, setRoutinesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    get<Paginated<Routine>>('/routines', { page: 1, limit: 5 })
      .then((result) => {
        setRoutines(result.data);
        setRoutinesTotal(result.meta.total);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Rutinas registradas"
          value={routinesTotal}
          icon={<Dumbbell />}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Acciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/routines">Ver rutinas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {error && <ErrorAlert message={error} />}
      {loading ? (
        <LoadingRows />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Rutinas recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyState message="Sin rutinas" />
                    </TableCell>
                  </TableRow>
                )}
                {routines.map((routine) => (
                  <TableRow key={routine.id}>
                    <TableCell className="font-medium">
                      {routine.name}
                    </TableCell>
                    <TableCell>{routine.member_name}</TableCell>
                    <TableCell>{formatDate(routine.start_date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={routine.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MemberDashboard() {
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const membersResult = await get<Paginated<Member>>('/members', {
          page: 1,
          limit: 100,
          search: user.email,
        });
        const myMember =
          membersResult.data.find((m) => m.user_email === user.email) ?? null;
        setMember(myMember);
        if (!myMember) return;

        const [
          membershipsResult,
          paymentsResult,
          attendanceResult,
          routinesResult,
        ] = await Promise.all([
          get<Envelope<Membership[]>>(`/members/${myMember.id}/memberships`),
          get<Envelope<Payment[]>>(`/members/${myMember.id}/payments`),
          get<Envelope<Attendance[]>>(`/members/${myMember.id}/attendance`),
          get<Envelope<Routine[]>>(`/members/${myMember.id}/routines`),
        ]);
        setMemberships(membershipsResult.data);
        setPayments(paymentsResult.data);
        setAttendance(attendanceResult.data);
        setRoutines(routinesResult.data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <LoadingRows rows={8} />;
  if (error) return <ErrorAlert message={error} />;
  if (!member) {
    return (
      <div>
        <PageHeader title="Mi cuenta" />
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center">
            No tienes un perfil de miembro registrado. Contacta al personal del
            gimnasio.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${user?.name}`}
        description="Tu actividad en el gimnasio"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Membresías"
          value={memberships.length}
          icon={<CreditCard />}
        />
        <StatCard title="Pagos" value={payments.length} icon={<Wallet />} />
        <StatCard
          title="Asistencias"
          value={attendance.length}
          icon={<CalendarCheck2 />}
        />
        <StatCard title="Rutinas" value={routines.length} icon={<Dumbbell />} />
      </div>

      <Tabs defaultValue="memberships">
        <TabsList>
          <TabsTrigger value="memberships">Membresías</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
          <TabsTrigger value="routines">Rutinas</TabsTrigger>
        </TabsList>

        <TabsContent value="memberships">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState message="Sin membresías" />
                      </TableCell>
                    </TableRow>
                  )}
                  {memberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium">
                        {membership.plan_name}
                      </TableCell>
                      <TableCell>{formatDate(membership.start_date)}</TableCell>
                      <TableCell>{formatDate(membership.end_date)}</TableCell>
                      <TableCell>{formatMoney(membership.price)}</TableCell>
                      <TableCell>
                        <StatusBadge status={membership.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <EmptyState message="Sin pagos" />
                      </TableCell>
                    </TableRow>
                  )}
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {formatMoney(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell>
                        {formatDateTime(payment.payment_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <EmptyState message="Sin asistencias" />
                      </TableCell>
                    </TableRow>
                  )}
                  {attendance.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDateTime(entry.check_in_at)}</TableCell>
                      <TableCell>
                        {formatDateTime(entry.check_out_at)}
                      </TableCell>
                      <TableCell>
                        {formatDuration(entry.duration_minutes)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routines">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Entrenador</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState message="Sin rutinas" />
                      </TableCell>
                    </TableRow>
                  )}
                  {routines.map((routine) => (
                    <TableRow key={routine.id}>
                      <TableCell className="font-medium">
                        {routine.name}
                      </TableCell>
                      <TableCell>{routine.trainer_name}</TableCell>
                      <TableCell>{formatDate(routine.start_date)}</TableCell>
                      <TableCell>{formatDate(routine.end_date)}</TableCell>
                      <TableCell>
                        <StatusBadge status={routine.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'receptionist')
    return <StaffDashboard />;
  if (user?.role === 'trainer') return <TrainerDashboard />;
  return <MemberDashboard />;
}
