import { useMemo } from 'react';
import { CompanyFiliereResult } from '@/lib/analyse/types';
import {
  KpiMetrics,
  FiliereChartEntry,
  CompanyPieEntry,
  CompanyFiliereDetail,
} from './types-matrice';

const safeNum = (val: unknown, fallback = 0): number => {
  const n = Number(val);
  return isFinite(n) ? n : fallback;
};

interface UseMatriceDataReturn {
  kpiMetrics: KpiMetrics;
  allFilieres: string[];
  filiereDistributionData: FiliereChartEntry[];
  companyStudentData: CompanyPieEntry[];
  getCompaniesForFiliere: (filiere: string) => CompanyFiliereDetail[];
  filterFilieres: (search: string) => string[];
  getCompanyCountForFiliere: (filiere: string) => number;
}

export function useMatriceData(data: CompanyFiliereResult[]): UseMatriceDataReturn {
  const kpiMetrics = useMemo<KpiMetrics>(() => {
    const allFilieres = new Set<string>();
    let totalStudents = 0;
    let totalPartnerships = 0;

    data.forEach((company) => {
      totalStudents += safeNum(company.totalEtudiants);
      (company.filieres ?? []).forEach((f) => {
        allFilieres.add(f.filiere);
        totalPartnerships += 1;
      });
    });

    const totalCompanies = data.length;
    const totalFilieres = allFilieres.size;

    return {
      totalCompanies,
      totalFilieres,
      totalStudents,
      totalPartnerships,
      avgStudentsPerCompany: totalCompanies
        ? (totalStudents / totalCompanies).toFixed(1)
        : '0',
      avgStudentsPerFiliere: totalFilieres
        ? (totalStudents / totalFilieres).toFixed(1)
        : '0',
    };
  }, [data]);

  const allFilieres = useMemo<string[]>(() => {
    const set = new Set<string>();
    data.forEach((c) => (c.filieres ?? []).forEach((f) => set.add(f.filiere)));
    return Array.from(set).sort();
  }, [data]);

  const filiereDistributionData = useMemo<FiliereChartEntry[]>(() =>
    allFilieres.map((filiere) => {
      let students = 0;
      let companies = 0;
      data.forEach((company) => {
        const match = (company.filieres ?? []).find((f) => f.filiere === filiere);
        if (match) {
          students += safeNum(match.nombreEtudiants);
          companies += 1;
        }
      });
      return { name: filiere, students, companies };
    }),
  [data, allFilieres]);

  const companyStudentData = useMemo<CompanyPieEntry[]>(() =>
    [...data]
      .map((c) => ({ name: c.companyName ?? c.companyId, value: safeNum(c.totalEtudiants) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
  [data]);

  const getCompaniesForFiliere = useMemo(
    () => (filiere: string): CompanyFiliereDetail[] =>
      data
        .flatMap((company) => {
          const match = (company.filieres ?? []).find((f) => f.filiere === filiere);
          if (!match) return [];
          return [{
            companyId: company.companyId,
            companyName: company.companyName,
            secteur: company.secteur,
            nombreEtudiants: safeNum(match.nombreEtudiants),
            moyenneNotes: safeNum(match.moyenneNotes),
          }];
        })
        .sort((a, b) => b.nombreEtudiants - a.nombreEtudiants),
    [data],
  );

  const filterFilieres = useMemo(
    () => (search: string): string[] =>
      search
        ? allFilieres.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
        : allFilieres,
    [allFilieres],
  );

  const getCompanyCountForFiliere = useMemo(
    () => (filiere: string): number =>
      data.filter((c) => (c.filieres ?? []).some((f) => f.filiere === filiere)).length,
    [data],
  );

  return {
    kpiMetrics,
    allFilieres,
    filiereDistributionData,
    companyStudentData,
    getCompaniesForFiliere,
    filterFilieres,
    getCompanyCountForFiliere,
  };
}
