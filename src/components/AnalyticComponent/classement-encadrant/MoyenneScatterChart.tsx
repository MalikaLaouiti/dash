import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { ScatterEntry } from '@/hooks/types-classement';

const tooltipStyle = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
};

interface MoyenneScatterChartProps {
  data: ScatterEntry[];
}

export function MoyenneScatterChart({ data }: MoyenneScatterChartProps) {
  const academique    = data.filter((d) => d.categorie === 'academique');
  const professionnel = data.filter((d) => d.categorie === 'professionnel');

  return (
    <Card className="p-6 border border-border/50 bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Étudiants vs Moyenne
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" dataKey="x" name="Étudiants" stroke="var(--color-muted-foreground)" />
          <YAxis type="number" dataKey="y" name="Moyenne"   stroke="var(--color-muted-foreground)" />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter name="Académique"    data={academique}    fill="var(--color-primary)" />
          <Scatter name="Professionnel" data={professionnel} fill="var(--color-primary)/60" />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
}
