import { useEffect, useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { usePaginated } from '@/hooks/usePaginated';
import { errorMessage, get, post } from '@/lib/apiClient';
import type { Attendance, Envelope, Member, Paginated } from '@/types/api';
import { formatDateTime, formatDuration } from '@/lib/format';
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
  ErrorAlert,
  LoadingRows,
  EmptyState,
} from '@/components/shared/DataState';
import { PageHeader, PaginationBar } from '@/components/shared/PageParts';

export default function AttendancePage() {
  const { user } = useAuth();
  const isStaff =
    user?.role === 'admin' ||
    user?.role === 'receptionist' ||
    user?.role === 'trainer';
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
  } = usePaginated<Attendance>('/attendance');

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isStaff) return;
    get<Paginated<Member>>('/members', { page: 1, limit: 100 })
      .then((result) => setMembers(result.data))
      .catch(() => setMembers([]));
  }, [isStaff]);

  // refresco periódico (check-out de otros dispositivos)
  useEffect(() => {
    const timer = setInterval(reload, 30000);
    return () => clearInterval(timer);
  }, [reload]);

  const doCheckIn = async () => {
    if (isStaff && !selectedMember) {
      toast.error('Selecciona un miembro');
      return;
    }
    setChecking(true);
    try {
      const body = isStaff ? { memberId: selectedMember } : {};
      await post<Envelope<Attendance>>('/attendance/check-in', body);
      toast.success('Check-in registrado');
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  const doCheckOut = async () => {
    if (isStaff && !selectedMember) {
      toast.error('Selecciona un miembro');
      return;
    }
    setChecking(true);
    try {
      const body = isStaff ? { memberId: selectedMember } : {};
      await post<Envelope<Attendance>>('/attendance/check-out', body);
      toast.success('Check-out registrado');
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Asistencia"
        description={
          isStaff
            ? 'Check-in y check-out de los miembros'
            : 'Registra tu entrada y salida del gimnasio'
        }
      >
        {isStaff && (
          <div className="flex items-center gap-2">
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecciona un miembro" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.user_name ?? member.document_number ?? member.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={doCheckIn}
              disabled={checking || !selectedMember}
            >
              <LogIn />
              Check-in
            </Button>
            <Button
              variant="outline"
              onClick={doCheckOut}
              disabled={checking || !selectedMember}
            >
              <LogOut />
              Check-out
            </Button>
          </div>
        )}
        {!isStaff && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={doCheckIn} disabled={checking}>
              <LogIn />
              Mi check-in
            </Button>
            <Button variant="outline" onClick={doCheckOut} disabled={checking}>
              <LogOut />
              Mi check-out
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <Label className="text-muted-foreground text-sm">
          {data.filter((a) => !a.check_out_at).length} check-ins abiertos
        </Label>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading ? (
        <LoadingRows />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Duración</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
            {data.map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell className="font-medium">
                  {attendance.member_name}
                </TableCell>
                <TableCell>{formatDateTime(attendance.check_in_at)}</TableCell>
                <TableCell>{formatDateTime(attendance.check_out_at)}</TableCell>
                <TableCell>
                  {formatDuration(attendance.duration_minutes)}
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
    </div>
  );
}
