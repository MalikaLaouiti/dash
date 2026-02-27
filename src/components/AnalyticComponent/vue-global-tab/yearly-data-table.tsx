// components/yearly-data-table.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { YearComparisonResult } from '@/lib/analyse/types';

interface YearlyDataTableProps {
  years: YearComparisonResult["parAnnee"];
}

export function YearlyDataTable({ years }: YearlyDataTableProps) {
  return (
    <Card className="p-6 border border-border/50 overflow-x-auto">
      <div className="mb-6">
        <h4 className="font-semibold text-foreground mb-1">
          Détails par Année
        </h4>
        <p className="text-sm text-muted-foreground">
          Données complètes de chaque année
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">Année</th>
            <th className="text-right py-3 px-4 font-semibold text-foreground">Étudiants</th>
            <th className="text-right py-3 px-4 font-semibold text-foreground">Entreprises</th>
            <th className="text-right py-3 px-4 font-semibold text-foreground">Encadreurs</th>
            <th className="text-right py-3 px-4 font-semibold text-foreground">Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {years.map((year) => (
            <tr key={year.annee} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 text-foreground font-medium">{year.annee}</td>
              <td className="text-right py-3 px-4 text-foreground">{year.totalEtudiants}</td>
              <td className="text-right py-3 px-4 text-foreground">{year.totalEntreprises}</td>
              <td className="text-right py-3 px-4 text-foreground">{year.totalEncadrants}</td>
              <td className="text-right py-3 px-4 text-foreground">
                <Badge variant="secondary" className="bg-blue-100/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {year.moyenneNotesGlobale.toFixed(2)}/20
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}