import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { CompanyPieEntry } from '@/hooks/types-matrice';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#6366f1', '#f97316',
];

const renderLabel = ({ name, value }: CompanyPieEntry) =>
  `${String(name).substring(0, 12)}… (${value})`;

interface CompanyPieChartProps {
  data: CompanyPieEntry[];
}

export function CompanyPieChart({ data }: CompanyPieChartProps) {
  return (
    <Card className="p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Top Entreprises par Étudiants</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
