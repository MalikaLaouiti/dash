import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { FiliereChartEntry } from '@/hooks/types-matrice';

interface FiliereBarChartProps {
  data: FiliereChartEntry[];
}

export function FiliereBarChart({ data }: FiliereBarChartProps) {
  return (
    <Card className="p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Distribution par Filière</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
          <YAxis stroke="var(--color-muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
            }}
          />
          <Legend />
          <Bar dataKey="students"  fill="#3b82f6" name="Étudiants" />
          <Bar dataKey="companies" fill="#8b5cf6" name="Entreprises" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
