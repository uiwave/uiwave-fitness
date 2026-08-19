import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './auth/AuthContext'
import { RequireAuth, RequireRole } from './auth/RequireRole'
import AppLayout from './components/layout/AppLayout'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/sonner'

import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import DashboardPage from './pages/DashboardPage'
import MembersPage from './pages/MembersPage'
import UsersPage from './pages/UsersPage'
import PlansPage from './pages/PlansPage'
import MembershipsPage from './pages/MembershipsPage'
import PaymentsPage from './pages/PaymentsPage'
import TrainersPage from './pages/TrainersPage'
import ExercisesPage from './pages/ExercisesPage'
import RoutinesPage from './pages/RoutinesPage'
import AttendancePage from './pages/AttendancePage'
import NotificationsPage from './pages/NotificationsPage'
import ReportsPage from './pages/ReportsPage'

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
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
          </Routes>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App