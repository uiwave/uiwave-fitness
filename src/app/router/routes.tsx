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

        <Route
          path="members"
          element={
            <RequireRole roles={['admin', 'trainer', 'receptionist']}>
              <MembersPage />
            </RequireRole>
          }
        />

        <Route path="plans" element={<PlansPage />} />

        <Route
          path="memberships"
          element={
            <RequireRole roles={['admin', 'trainer', 'receptionist']}>
              <MembershipsPage />
            </RequireRole>
          }
        />

        <Route
          path="payments"
          element={
            <RequireRole roles={['admin', 'receptionist']}>
              <PaymentsPage />
            </RequireRole>
          }
        />

        <Route
          path="trainers"
          element={
            <RequireRole roles={['admin', 'trainer', 'receptionist']}>
              <TrainersPage />
            </RequireRole>
          }
        />

        <Route path="exercises" element={<ExercisesPage />} />

        <Route
          path="routines"
          element={
            <RequireRole roles={['admin', 'trainer', 'member']}>
              <RoutinesPage />
            </RequireRole>
          }
        />

        <Route path="attendance" element={<AttendancePage />} />

        <Route
          path="users"
          element={
            <RequireRole roles={['admin', 'receptionist']}>
              <UsersPage />
            </RequireRole>
          }
        />

        <Route
          path="reports"
          element={
            <RequireRole roles={['admin', 'receptionist']}>
              <ReportsPage />
            </RequireRole>
          }
        />

        <Route path="notifications" element={<NotificationsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </>
  );
}
