import { CompanyCapacityResult, CompanyFiliereResult, CompanyLoyaltyResult, TopSupervisorResult, YearComparisonResult } from "../analyse/types";

const BASE = '/api/analytics';

async function fetchAnalytics<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}?${qs}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Erreur HTTP ${res.status}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error ?? 'Erreur inconnue');
  }

  return json.data as T;
}

// ── Actions ─────────────────────────────────────────────────────────────────

export async function getTopSupervisors(
  year: string,
  categorie?: 'academique' | 'professionnel',
  limit = 10,
) {
  return fetchAnalytics<TopSupervisorResult[]>({
    action: 'top-supervisors',
    year,
    ...(categorie ? { categorie } : {}),
    limit: String(limit),
  });
}

export async function getCompanyFiliere(year: string, minStudents = 1) {
  return fetchAnalytics<CompanyFiliereResult[]>({
    action: 'company-filiere',
    year,
    minStudents: String(minStudents),
  });
}

export async function getCompanyLoyalty(years: string[]) {
  return fetchAnalytics<CompanyLoyaltyResult[]>({
    action: 'company-loyalty',
    years: years.join(','),
  });
}

export async function getCompanyCapacity(year: string) {
  return fetchAnalytics<CompanyCapacityResult>({
    action: 'company-capacity',
    year,
  });
}

export async function getYearComparison(years: string[]) {
  return fetchAnalytics<YearComparisonResult[]>({
    action: 'year-comparison',
    years: years.join(','),
  });
}