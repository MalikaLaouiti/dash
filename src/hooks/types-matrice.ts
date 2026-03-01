// ─── Types locaux (en plus de CompanyFiliereResult de @/lib/analyse/types) ───

export interface KpiMetrics {
  totalCompanies: number;
  totalFilieres: number;
  totalStudents: number;
  totalPartnerships: number;
  avgStudentsPerCompany: string;
  avgStudentsPerFiliere: string;
}

export interface FiliereChartEntry {
  name: string;
  students: number;
  companies: number;
}

export interface CompanyPieEntry {
  name: string;
  value: number;
}

export interface CompanyFiliereDetail {
  companyId: string;
  companyName: string | undefined;
  secteur: string | undefined;
  nombreEtudiants: number;
  moyenneNotes: number;
}
