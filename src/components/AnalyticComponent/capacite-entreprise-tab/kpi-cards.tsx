'use client';

import { Card } from '@/components/ui/card';

interface KpiCardsProps {
  totalCompanies: number;
  grandesCount: number;
  moyennesCount: number;
  petitesCount: number;
  totalCapacity: number;
  averageCapacity: number;
  utilizationRate: number;
}

export function KpiCards({ 
  totalCompanies, 
  grandesCount, 
  moyennesCount,
  petitesCount, 
  totalCapacity, 
  averageCapacity,
  utilizationRate 
}: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-6 border border-border/50">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Entreprises</p>
          <p className="text-3xl font-bold text-foreground">{totalCompanies}</p>
          <p className="text-xs text-muted-foreground">
            {grandesCount} grandes, {moyennesCount} moyennes
          </p>
        </div>
      </Card>

      <Card className="p-6 border border-border/50">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Capacité Totale</p>
          <p className="text-3xl font-bold text-foreground">{totalCapacity}</p>
        </div>
      </Card>

      <Card className="p-6 border border-border/50">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Capacité Moyenne</p>
          <p className="text-3xl font-bold text-foreground">{averageCapacity.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">par entreprise</p>
        </div>
      </Card>

      <Card className="p-6 border border-border/50">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Taux Utilisation</p>
          <p className="text-3xl font-bold text-foreground">{utilizationRate}%</p>
        </div>
      </Card>
    </div>
  );
}