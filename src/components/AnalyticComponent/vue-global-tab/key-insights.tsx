'use client';

import { Card } from '@/components/ui/card';
import { YearComparisonResult } from '@/lib/analyse/types';

interface KeyInsightsProps {
  years: YearComparisonResult["parAnnee"];
  trends: YearComparisonResult["tendances"];
}
interface YearlyDataTableProps {
  
}

export function KeyInsights({ years, trends }: KeyInsightsProps) {
  const latestYear = years[years.length - 1];
  const firstYear = years[0];

  return (
    <Card className="p-6 border border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
      <h4 className="font-semibold text-foreground mb-4">Points Clés</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Croissance des Étudiants</p>
          <p className="text-2xl font-bold text-foreground">
            +{trends.croissanceEtudiants.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">
            De {firstYear.totalEtudiants} à {latestYear.totalEtudiants}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Croissance des Entreprises</p>
          <p className="text-2xl font-bold text-foreground">
            +{trends.croissanceEntreprises.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">
            De {firstYear.totalEntreprises} à {latestYear.totalEntreprises}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Stabilité des Notes</p>
          <p className={`text-2xl font-bold ${
            trends.evolutionNotes >= 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {trends.evolutionNotes >= 0 ? '+' : ''}{trends.evolutionNotes.toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground">
            Notes globales stables
          </p>
        </div>
      </div>
    </Card>
  );
}