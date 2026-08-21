import { useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, Settings } from 'lucide-react';

import { useAuth } from '@/auth/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { TeamSwitcher } from './TeamSwitcher';
import { NavMain, type NavItem } from './NavMain';
import { NavUser } from './NavUser';

const data: { navMain: NavItem[] } = {
  navMain: [
    {
      title: 'Principal',
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: 'Inicio',
          url: '/',
          roles: ['admin', 'trainer', 'receptionist', 'member'],
        },
        {
          title: 'Notificaciones',
          url: '/notifications',
          roles: ['admin', 'trainer', 'receptionist', 'member'],
        },
      ],
    },

    {
      title: 'Gestión',
      icon: Dumbbell,
      items: [
        {
          title: 'Miembros',
          url: '/members',
          roles: ['admin', 'trainer', 'receptionist'],
        },
        {
          title: 'Planes',
          url: '/plans',
          roles: ['admin', 'trainer', 'receptionist', 'member'],
        },
        {
          title: 'Membresías',
          url: '/memberships',
          roles: ['admin', 'trainer', 'receptionist'],
        },
        {
          title: 'Pagos',
          url: '/payments',
          roles: ['admin', 'receptionist'],
        },
        {
          title: 'Entrenadores',
          url: '/trainers',
          roles: ['admin', 'trainer', 'receptionist'],
        },
        {
          title: 'Ejercicios',
          url: '/exercises',
          roles: ['admin', 'trainer', 'receptionist', 'member'],
        },
        {
          title: 'Rutinas',
          url: '/routines',
          roles: ['admin', 'trainer', 'member'],
        },
        {
          title: 'Asistencia',
          url: '/attendance',
          roles: ['admin', 'trainer', 'receptionist'],
        },
      ],
    },

    {
      title: 'Sistema',
      icon: Settings,
      items: [
        {
          title: 'Usuarios',
          url: '/users',
          roles: ['admin'],
        },
        {
          title: 'Reportes',
          url: '/reports',
          roles: ['admin', 'receptionist'],
        },
      ],
    },
  ],
};

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
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} role={user.role} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.image ?? '',
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
