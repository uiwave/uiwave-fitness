import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  Home,
  ListChecks,
  LogOut,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';

import { useAuth } from '@/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { UserRole } from '@/types/api';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      {
        to: '/',
        label: 'Inicio',
        icon: Home,
        roles: ['admin', 'trainer', 'receptionist', 'member'],
      },
      {
        to: '/notifications',
        label: 'Notificaciones',
        icon: Bell,
        roles: ['admin', 'trainer', 'receptionist', 'member'],
      },
    ],
  },
  {
    label: 'Gestión',
    items: [
      {
        to: '/members',
        label: 'Miembros',
        icon: Users,
        roles: ['admin', 'trainer', 'receptionist'],
      },
      {
        to: '/plans',
        label: 'Planes',
        icon: ClipboardList,
        roles: ['admin', 'trainer', 'receptionist', 'member'],
      },
      {
        to: '/memberships',
        label: 'Membresías',
        icon: BadgeCheck,
        roles: ['admin', 'trainer', 'receptionist'],
      },
      {
        to: '/payments',
        label: 'Pagos',
        icon: Banknote,
        roles: ['admin', 'receptionist'],
      },
      {
        to: '/trainers',
        label: 'Entrenadores',
        icon: UserCheck,
        roles: ['admin', 'trainer', 'receptionist'],
      },
      {
        to: '/exercises',
        label: 'Ejercicios',
        icon: Dumbbell,
        roles: ['admin', 'trainer', 'receptionist', 'member'],
      },
      {
        to: '/routines',
        label: 'Rutinas',
        icon: ListChecks,
        roles: ['admin', 'trainer', 'member'],
      },
      {
        to: '/attendance',
        label: 'Asistencia',
        icon: CalendarCheck,
        roles: ['admin', 'trainer', 'receptionist'],
      },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        to: '/users',
        label: 'Usuarios',
        icon: UserCog,
        roles: ['admin'],
      },
      {
        to: '/reports',
        label: 'Reportes',
        icon: BarChart3,
        roles: ['admin', 'receptionist'],
      },
    ],
  },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                  <Dumbbell className="size-4" />
                </span>
                <span className="font-semibold">GYM Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) =>
            item.roles.includes(user.role),
          );
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.to}
                              end={item.to === '/'}
                              className={({ isActive }) =>
                                cn(
                                  isActive &&
                                    'bg-sidebar-accent text-sidebar-accent-foreground',
                                )
                              }
                            >
                              <item.icon />
                              <span>{item.label}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.role}</span>
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              >
                <DropdownMenuLabel>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-xs font-normal">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
