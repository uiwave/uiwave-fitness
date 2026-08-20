// Envelope de respuestas
export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface NotificationMeta extends Meta {
  unread: number;
}

export interface Envelope<T> {
  data: T;
}

export interface Paginated<T> {
  data: T[];
  meta: Meta;
}

export interface DeletedResponse {
  id: string;
  deleted: true;
}

export interface UpdatedCountResponse {
  updated: number;
}

export type UserRole = 'admin' | 'trainer' | 'receptionist' | 'member';

// Usuario (Better Auth, id = texto 32 chars hex, campos camelCase)
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
}

export interface SignInResponse {
  user: User;
  session: Session;
}

export interface RoleUpdateResponse {
  id: string;
  role: UserRole;
}

export interface BanResponse {
  id: string;
  banned: boolean;
}

// ---- Members (lowercase status) ----
export type MemberStatus = 'active' | 'inactive' | 'suspended';

export interface Member {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  document_number: string | null;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

// ---- Plans (lowercase status) ----
export type PlanStatus = 'active' | 'inactive';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

// ---- Memberships (UPPERCASE status) ----
export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

export interface Membership {
  id: string;
  member_id: string;
  member_name: string;
  member_email: string;
  member_document_number: string;
  plan_id: string;
  plan_name: string;
  plan_duration_days: number;
  start_date: string;
  end_date: string;
  price: number;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
}

// ---- Payments (UPPERCASE) ----
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod =
  'CASH' | 'CARD' | 'TRANSFER' | 'YAPE' | 'PLIN' | 'OTHER';

export interface Payment {
  id: string;
  member_id: string;
  member_name: string;
  member_email: string;
  member_document_number: string;
  membership_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Trainers (lowercase status) ----
export type TrainerStatus = 'active' | 'inactive';

export interface Trainer {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  specialization: string | null;
  phone: string | null;
  bio: string | null;
  status: TrainerStatus;
  created_at: string;
  updated_at: string;
}

// ---- Exercises (UPPERCASE difficulty) ----
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: Difficulty;
  instructions: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Routines (UPPERCASE status) ----
export type RoutineStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

export interface Routine {
  id: string;
  member_id: string;
  member_name: string;
  member_document_number: string;
  trainer_id: string;
  trainer_name: string;
  trainer_specialization: string | null;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: RoutineStatus;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  exercise_name: string;
  exercise_muscle_group: string | null;
  exercise_difficulty: Difficulty;
  sets: number;
  repetitions: number;
  weight: number;
  rest_seconds: number;
  notes: string | null;
  order_index: number;
}

// ---- Attendance ----
export interface Attendance {
  id: string;
  member_id: string;
  member_name: string;
  member_document_number: string;
  check_in_at: string;
  check_out_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Notifications (UPPERCASE type) ----
export type NotificationType =
  'INFO' | 'WARNING' | 'SUCCESS' | 'PAYMENT' | 'MEMBERSHIP' | 'SYSTEM';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: NotificationMeta;
}

// ---- Reports ----
export interface DashboardReport {
  totalMembers: number;
  activeMembers: number;
  activeMemberships: number;
  expiredMemberships: number;
  monthlyRevenue: number;
  todayAttendance: number;
  pendingPayments: number;
}

export interface MembersReport {
  byStatus: { status: string; total: number }[];
  newPerMonth: { month: string; total: number }[];
}

export interface RevenueReport {
  totalRevenue: number;
  byMonth: { month: string; payments: number; total: number }[];
  byMethod: { payment_method: string; payments: number; total: number }[];
}

export interface AttendanceReport {
  daily: { day: string; check_ins: number; check_outs: number }[];
  averagePerDay: number;
}

export interface MembershipsReport {
  byStatus: { status: string; total: number }[];
  expiringSoon: number;
  expiringSoonList: { id: string; member_name: string; end_date: string }[];
}
