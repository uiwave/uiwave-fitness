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
  element: ReactNode;
  roles?: Role[];
};

const routes: RouteConfig[] = [
  {
    path: 'members',
    element: <MembersPage />,
    roles: ['admin', 'trainer', 'receptionist'],
  },
  {
    path: 'plans',
    element: <PlansPage />,
  },
  {
    path: 'memberships',
    element: <MembershipsPage />,
    roles: ['admin', 'trainer', 'receptionist'],
  },
  {
    path: 'payments',
    element: <PaymentsPage />,
    roles: ['admin', 'receptionist'],
  },
  {
    path: 'trainers',
    element: <TrainersPage />,
    roles: ['admin', 'trainer', 'receptionist'],
  },
  {
    path: 'exercises',
    element: <ExercisesPage />,
  },
  {
    path: 'routines',
    element: <RoutinesPage />,
    roles: ['admin', 'trainer', 'member'],
  },
  {
    path: 'attendance',
    element: <AttendancePage />,
  },
  {
    path: 'users',
    element: <UsersPage />,
    roles: ['admin', 'receptionist'],
  },
  {
    path: 'reports',
    element: <ReportsPage />,
    roles: ['admin', 'receptionist'],
  },
  {
    path: 'notifications',
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
