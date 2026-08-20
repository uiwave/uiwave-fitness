import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';

import { get, patch, errorMessage } from '@/lib/apiClient';
import type { PaginatedNotifications } from '@/types/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Separator } from '@/components/ui/separator';

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<
    PaginatedNotifications['data']
  >([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await get<PaginatedNotifications>('/notifications', {
        read: 'false',
        limit: 5,
      });
      setNotifications(result.data);
      setUnread(result.meta.unread);
    } catch {
      // silencioso: el badge no debe romper la navegación
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await patch(`/notifications/${id}/read`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      load();
    }
  };

  const markAllRead = async () => {
    try {
      await patch('/notifications/read-all');
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      load();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificaciones"
          className="relative"
        >
          <Bell />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 size-5 min-w-5 justify-center rounded-full p-0 text-[10px]">
              {unread > 99 ? '99+' : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          <span className="text-muted-foreground text-xs">
            {unread} sin leer
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="text-muted-foreground px-2 py-4 text-center text-sm">
              No hay notificaciones
            </p>
          )}
          {notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-1 py-2 align-baseline"
              onClick={() => markRead(n.id)}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="text-sm font-medium">{n.title}</span>
                <StatusBadge status={n.type} />
              </span>
              <span className="text-muted-foreground text-xs">{n.message}</span>
              <span className="text-muted-foreground/70 text-xs">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={markAllRead}
              >
                <CheckCheck />
                Marcar todas como leídas
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
