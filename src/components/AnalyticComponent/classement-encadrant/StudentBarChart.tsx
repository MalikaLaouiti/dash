import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { BarChartEntry } from '@/hooks/types-classement';

const tooltipStyle = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
};

interface StudentBarChartProps {
  data: BarChartEntry[];
}

export function StudentBarChart({ data }: StudentBarChartProps) {
  return (
    <Card className="p-6 border border-border/50 bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Distribution des Étudiants
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
          <YAxis stroke="var(--color-muted-foreground)" />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="etudiants" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
