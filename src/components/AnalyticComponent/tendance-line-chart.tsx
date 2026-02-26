'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { YearComparisonResult } from '@/lib/analyse/types';

interface TendanceLineChartProps {
  data: YearComparisonResult["parAnnee"];
}

export function TendanceLineChart({ data }: TendanceLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="annee"
          stroke="var(--color-muted-foreground)"
          style={{ fontSize: '0.875rem' }}
        />
        <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '0.875rem' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'var(--color-foreground)' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalEtudiants"
          stroke="rgb(59, 130, 246)"
          name="Étudiants"
          strokeWidth={2}
          dot={{ fill: 'rgb(59, 130, 246)', r: 5 }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="totalEntreprises"
          stroke="rgb(168, 85, 247)"
          name="Entreprises"
          strokeWidth={2}
          dot={{ fill: 'rgb(168, 85, 247)', r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}