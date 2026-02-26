// components/charts-section.tsx
'use client';

import { Card } from '@/components/ui/card';
import { TendanceLineChart } from './tendance-line-chart';
import { ComparaisonBarChart } from './comparaison-bar-chart';
import { YearComparisonResult } from '@/lib/analyse/types';

interface ChartsSectionProps {
  years: YearComparisonResult['parAnnee'];
}

export function ChartsSection({ years }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart - Trends Over Time */}
      <Card className="p-6 border border-border/50">
        <div className="mb-6">
          <h4 className="font-semibold text-foreground mb-1">Évolution Temporelle</h4>
          <p className="text-sm text-muted-foreground">
            Tendances des étudiants et entreprises
          </p>
        </div>
        <div className="h-64 w-full">
          <TendanceLineChart data={years} />
        </div>
      </Card>

      {/* Bar Chart - Year Comparison */}
      <Card className="p-6 border border-border/50">
        <div className="mb-6">
          <h4 className="font-semibold text-foreground mb-1">
            Comparaison Annuelle
          </h4>
          <p className="text-sm text-muted-foreground">
            Vue détaillée par année
          </p>
        </div>
        <div className="h-64 w-full">
          <ComparaisonBarChart data={years} />
        </div>
      </Card>
    </div>
  );
}