import type { ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';

import { RequireAuth, RequireRole } from '../../auth/RequireRole';

import AppLayout from '../../components/layout/AppLayout';

import {
  AttendancePage,
  DashboardPage,
  ExercisesPage,
  LoginPage,
  MembersPage,
  MembershipsPage,
  NotFoundPage,
  NotificationsPage,
  PaymentsPage,
  PlansPage,
  ReportsPage,
  RoutinesPage,
  TrainersPage,
  UsersPage,
} from './lazyPages';

type Role = 'admin' | 'trainer' | 'receptionist' | 'member';

type RouteConfig = {
  path: string;
  label: string;
  element: ReactNode;
  roles?: Role[];
};

export const routes: RouteConfig[] = [
  {
    path: 'members',
    label: 'Miembros',
    element: <MembersPage />,
    roles: ['admin', 'trainer', 'receptionist'],
  },
  {
    path: 'plans',
    label: 'Planes',
    element: <PlansPage />,
  },
  {
    path: 'memberships',
    label: 'Membresías',
    element: <MembershipsPage />,
    roles: ['admin', 'trainer', 'receptionist'],
  },
  {
    path: 'payments',
    label: 'Pagos',
    element: <PaymentsPage />,
    roles: ['admin', 'receptionist'],
  },
  {
    path: 'trainers',
    label: 'Entrenadores',
    element: <TrainersPage />,
    roles: ['admin', 'trainer', 'receptionist'],
  },
  {
    path: 'exercises',
    label: 'Ejercicios',
    element: <ExercisesPage />,
  },
  {
    path: 'routines',
    label: 'Rutinas',
    element: <RoutinesPage />,
    roles: ['admin', 'trainer', 'member'],
  },
  {
    path: 'attendance',
    label: 'Asistencia',
    element: <AttendancePage />,
  },
  {
    path: 'users',
    label: 'Usuarios',
    element: <UsersPage />,
    roles: ['admin', 'receptionist'],
  },
  {
    path: 'reports',
    label: 'Reportes',
    element: <ReportsPage />,
    roles: ['admin', 'receptionist'],
  },
  {
    path: 'notifications',
    label: 'Notificaciones',
    element: <NotificationsPage />,
  },
];

function renderRoute(route: RouteConfig) {
  const element = route.roles ? (
    <RequireRole roles={route.roles}>{route.element}</RequireRole>
  ) : (
    route.element
  );

  return <Route key={route.path} path={route.path} element={element} />;
}

export function appRoutes() {
  return (
    <>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />

        {routes.map(renderRoute)}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </>
  );
}
