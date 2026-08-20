import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatMoney } from '@/lib/format';

export const CHART_COLORS = [
  '#16a34a',
  '#f59e0b',
  '#ef4444',
  '#0ea5e9',
  '#8b5cf6',
  '#71717a',
];

export function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-64">{children}</CardContent>
    </Card>
  );
}

export function RevenueBarChart({
  data,
}: {
  data: { month: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-border"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        <Bar
          dataKey="total"
          fill="var(--color-primary)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceAreaChart({
  data,
}: {
  data: { day: string; check_ins: number; check_outs: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-border"
        />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="check_ins"
          name="Check-ins"
          stroke="#16a34a"
          fill="#16a34a"
          fillOpacity={0.15}
        />
        <Area
          type="monotone"
          dataKey="check_outs"
          name="Check-outs"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.15}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MembersLineChart({
  data,
}: {
  data: { month: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-border"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="total"
          name="Nuevos"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({
  data,
}: {
  data: { status: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="status"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.status}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MethodBarChart({
  data,
}: {
  data: { payment_method: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-border"
        />
        <XAxis
          dataKey="payment_method"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={entry.payment_method}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
