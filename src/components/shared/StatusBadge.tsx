import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const LOWER_OK: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  inactive: 'bg-muted text-muted-foreground',
  suspended: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const UPPER_OK: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  EXPIRED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400',
  FAILED: 'bg-red-500/10 text-red-600 dark:text-red-400',
  REFUNDED: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  INFO: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  WARNING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  SUCCESS: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  PAYMENT: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  MEMBERSHIP: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  SYSTEM: 'bg-muted text-muted-foreground',
  BEGINNER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  INTERMEDIATE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  ADVANCED: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function StatusBadge({ status }: { status: string }) {
  const className = UPPER_OK[status] ?? LOWER_OK[status];
  return (
    <Badge variant="outline" className={cn('font-normal', className)}>
      {status}
    </Badge>
  );
}
