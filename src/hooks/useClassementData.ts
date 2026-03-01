import { useMemo } from 'react';
import { TopSupervisorResult } from '@/lib/analyse/types';
import {
  FilterCategorie,
  SortBy,
  KpiSuperviseurs,
  BarChartEntry,
  ScatterEntry,
} from '../types';

interface UseClassementDataReturn {
  filteredData: TopSupervisorResult[];
  sortedData: TopSupervisorResult[];
  kpi: KpiSuperviseurs;
  barChartData: BarChartEntry[];
  scatterData: ScatterEntry[];
}

export function useClassementData(
  data: TopSupervisorResult[],
  filterCategorie: FilterCategorie,
  sortBy: SortBy,
): UseClassementDataReturn {
  const filteredData = useMemo<TopSupervisorResult[]>(
    () =>
      filterCategorie === 'all'
        ? data
        : data.filter((s) => s.categorie === filterCategorie),
    [data, filterCategorie],
  );

  const sortedData = useMemo<TopSupervisorResult[]>(
    () =>
      [...filteredData].sort((a, b) => {
        if (sortBy === 'students') return b.nombreEtudiants - a.nombreEtudiants;
        if (sortBy === 'moyenne')  return b.moyenneNotes   - a.moyenneNotes;
        return b.meilleurNote - a.meilleurNote;
      }),
    [filteredData, sortBy],
  );

  const kpi = useMemo<KpiSuperviseurs>(() => {
    const totalEtudiants = filteredData.reduce((sum, s) => sum + s.nombreEtudiants, 0);
    const averageMoyenne =
      filteredData.length > 0
        ? filteredData.reduce((sum, s) => sum + s.moyenneNotes, 0) / filteredData.length
        : 0;

    return {
      totalSuperviseurs:           filteredData.length,
      totalEtudiants,
      avgEtudiantsParSuperviseur:  filteredData.length > 0
        ? (totalEtudiants / filteredData.length).toFixed(1)
        : '0',
      averageMoyenne:              averageMoyenne.toFixed(2),
      academiqueSupervisors:       filteredData.filter((s) => s.categorie === 'academique').length,
      topSupervisorId:             sortedData[0]?.supervisorId,
      topSupervisorEtudiants:      sortedData[0]?.nombreEtudiants,
    };
  }, [filteredData, sortedData]);

  const barChartData = useMemo<BarChartEntry[]>(
    () =>
      sortedData.slice(0, 10).map((s) => ({
        name:      s.prenom,
        etudiants: s.nombreEtudiants,
        moyenne:   s.moyenneNotes,
      })),
    [sortedData],
  );

  const scatterData = useMemo<ScatterEntry[]>(
    () =>
      sortedData.map((s) => ({
        name:      s.prenom,
        x:         s.nombreEtudiants,
        y:         s.moyenneNotes,
        categorie: s.categorie,
      })),
    [sortedData],
  );

  return { filteredData, sortedData, kpi, barChartData, scatterData };
}
