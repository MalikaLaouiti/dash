'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CapacityPieChartProps {
  data: Array<{
    name: string;
    value: number;
    count: number;
    color: string;
  }>;
}

export function CapacityPieChart({ data }: CapacityPieChartProps) {
  return (
    <Card className="p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Distribution par Catégorie</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}