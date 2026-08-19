import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Dumbbell, LogOut } from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import type { UserRole } from '@/types/api'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', roles: ['admin', 'trainer', 'receptionist', 'member'] },
  { to: '/members', label: 'Miembros', roles: ['admin', 'trainer', 'receptionist'] },
  { to: '/plans', label: 'Planes', roles: ['admin', 'trainer', 'receptionist', 'member'] },
  { to: '/memberships', label: 'Membresías', roles: ['admin', 'trainer', 'receptionist'] },
  { to: '/payments', label: 'Pagos', roles: ['admin', 'receptionist'] },
  { to: '/trainers', label: 'Entrenadores', roles: ['admin', 'trainer', 'receptionist'] },
  { to: '/exercises', label: 'Ejercicios', roles: ['admin', 'trainer', 'receptionist', 'member'] },
  { to: '/routines', label: 'Rutinas', roles: ['admin', 'trainer', 'member'] },
  { to: '/attendance', label: 'Asistencia', roles: ['admin', 'trainer', 'receptionist'] },
  { to: '/users', label: 'Usuarios', roles: ['admin'] },
  { to: '/reports', label: 'Reportes', roles: ['admin', 'receptionist'] },
  { to: '/notifications', label: 'Notificaciones', roles: ['admin', 'trainer', 'receptionist', 'member'] },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role))

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="size-4" />
            </span>
            GYM Panel
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground',
                    isActive
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="hidden sm:inline">{user.name}</span>
                  <Badge variant="outline" className="hidden font-normal sm:inline-flex">
                    {user.role}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator />
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}