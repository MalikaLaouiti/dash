'use client';

import { Users, Building2, UserCheck, TrendingUp } from 'lucide-react';
import { MetricCard } from './metric-card';
import { ChartsSection } from './charts-section';
import { YearlyDataTable } from './yearly-data-table';
import { KeyInsights } from './key-insights';
import { YearComparisonResult } from '@/lib/analyse/types';

const mockData: YearComparisonResult = {
  parAnnee: [
    {
      annee: '2022',
      totalEtudiants: 228,
      totalEntreprises: 152,
      totalEncadrants: 225,
      moyenneNotesGlobale: 16.21,
    },
    {
      annee: '2023',
      totalEtudiants: 356,
      totalEntreprises: 208,
      totalEncadrants: 315,
      moyenneNotesGlobale: 16.26,
    },
    {
      annee: '2024',
      totalEtudiants: 389,
      totalEntreprises: 224,
      totalEncadrants: 323,
      moyenneNotesGlobale: 16.22,
    },
  ],
  tendances: {
    croissanceEtudiants: 70.61,
    croissanceEntreprises: 47.37,
    evolutionNotes: 0.06,
  },
};

interface VueGlobaleProps {
  data?: YearComparisonResult;
}

export function VueGlobale({ data }: VueGlobaleProps) {
  const displayData = data || mockData;
  const years = displayData.parAnnee;
  const trends = displayData.tendances;

  const latestYear = years[years.length - 1];
  const previousYear = years[years.length - 2];

  const calculateGrowth = (current: number, previous: number) => 
    ((current - previous) / previous) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Analyse Globale du Programme
        </h3>
        <p className="text-muted-foreground">
          Vue d'ensemble des indicateurs clés et tendances sur {years.length} années
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={`Étudiants (${latestYear.annee})`}
          value={latestYear.totalEtudiants}
          subValue={`vs ${previousYear.totalEtudiants} en ${previousYear.annee}`}
          icon={Users}
          iconColor="bg-blue-100/20 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
          trend={trends.croissanceEtudiants}
        />

        <MetricCard
          title={`Entreprises (${latestYear.annee})`}
          value={latestYear.totalEntreprises}
          subValue={`vs ${previousYear.totalEntreprises} en ${previousYear.annee}`}
          icon={Building2}
          iconColor="bg-purple-100/20 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
          trend={trends.croissanceEntreprises}
        />

        <MetricCard
          title={`Encadreurs (${latestYear.annee})`}
          value={latestYear.totalEncadrants}
          subValue={`vs ${previousYear.totalEncadrants} en ${previousYear.annee}`}
          icon={UserCheck}
          iconColor="bg-orange-100/20 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
          trend={calculateGrowth(latestYear.totalEncadrants, previousYear.totalEncadrants)}
        />

        <MetricCard
          title={`Note Moyenne (${latestYear.annee})`}
          value={latestYear.moyenneNotesGlobale}
          subValue={`vs ${previousYear.moyenneNotesGlobale.toFixed(2)} en ${previousYear.annee}`}
          icon={TrendingUp}
          iconColor="bg-green-100/20 dark:bg-green-950/30 text-green-600 dark:text-green-400"
          trend={trends.evolutionNotes}
          suffix="/20"
        />
      </div>

      {/* Charts Section */}
      <ChartsSection years={years} />

      {/* Detailed Year Comparison Table */}
      <YearlyDataTable years={years} />

      {/* Key Insights */}
      <KeyInsights years={years} trends={trends} />
    </div>
  );
}