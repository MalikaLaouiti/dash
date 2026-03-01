'use client';

import { useState } from 'react';
import { TopSupervisorResult } from '@/lib/analyse/types';
import { FilterCategorie, SortBy } from '@/hooks/types-classement';
import { useClassementData } from '@/hooks/useClassementData';
import { KpiCards } from './KpiCards';
import { SuperviseurFilters } from './SuperviseurFilters';
import { StudentBarChart } from './StudentBarChart';
import { MoyenneScatterChart } from './MoyenneScatterChart';
import { SuperviseurTable } from './SuperviseurTable';

interface ClassementSuperviseursProps {
  data: TopSupervisorResult[];
}

export function ClassementSuperviseurs({ data }: ClassementSuperviseursProps) {
  const [filterCategorie, setFilterCategorie] = useState<FilterCategorie>('all');
  const [sortBy, setSortBy]                   = useState<SortBy>('students');

  const { sortedData, kpi, barChartData, scatterData } = useClassementData(
    data,
    filterCategorie,
    sortBy,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Classement Superviseurs</h2>
        <p className="text-sm text-muted-foreground">
          Performance et analyse détaillée des superviseurs académiques et professionnels
        </p>
      </header>

      <KpiCards kpi={kpi} />

      <SuperviseurFilters
        filterCategorie={filterCategorie}
        sortBy={sortBy}
        onFilterChange={setFilterCategorie}
        onSortChange={setSortBy}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentBarChart     data={barChartData} />
        <MoyenneScatterChart data={scatterData}  />
      </div>

      <SuperviseurTable data={sortedData} />
    </div>
  );
}