'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { YearComparisonResult } from '@/lib/analyse/types';

interface ComparaisonBarChartProps {
  data: YearComparisonResult["parAnnee"];
}

export function ComparaisonBarChart({ data }: ComparaisonBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
        <Bar
          dataKey="totalEtudiants"
          fill="rgb(59, 130, 246)"
          name="Étudiants"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="totalEncadrants"
          fill="rgb(249, 115, 22)"
          name="Encadreurs"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}