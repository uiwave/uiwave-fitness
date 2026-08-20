import { lazy } from 'react';

export const LoginPage = lazy(() => import('@/pages/LoginPage'));
export const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
export const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
export const MembersPage = lazy(() => import('@/pages/MembersPage'));
export const UsersPage = lazy(() => import('@/pages/UsersPage'));
export const PlansPage = lazy(() => import('@/pages/PlansPage'));
export const MembershipsPage = lazy(() => import('@/pages/MembershipsPage'));
export const PaymentsPage = lazy(() => import('@/pages/PaymentsPage'));
export const TrainersPage = lazy(() => import('@/pages/TrainersPage'));
export const ExercisesPage = lazy(() => import('@/pages/ExercisesPage'));
export const RoutinesPage = lazy(() => import('@/pages/RoutinesPage'));
export const AttendancePage = lazy(() => import('@/pages/AttendancePage'));
export const NotificationsPage = lazy(
  () => import('@/pages/NotificationsPage'),
);
export const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
