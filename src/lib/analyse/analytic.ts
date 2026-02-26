import { CompanyFiliereResult,CompanyLoyaltyResult, CompanyCapacityResult,TopSupervisorResult, YearComparisonResult } from "./types";

export const getTopSupervisors = async (
  years: string[],
  categorie?: "professionnel" | "academique",
  limit?: number
) => {
  try {
    const params = new URLSearchParams({ action: "top-supervisors", years: years.join(",") });
    if (categorie) params.append("categorie", categorie);
    if (limit) params.append("limit", String(limit));

    const res = await fetch(`/api/analytics?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur lors de la récupération des encadrants");
    }

    const result = await res.json();
    return result.data as TopSupervisorResult;
  } catch (error) {
    console.error("Erreur top-supervisors:", error);
    throw error;
  }
};

export const getCompanyFiliere = async (years: string[], minStudents?: number) => {
  try {
    const params = new URLSearchParams({ action: "company-filiere", years: years.join(",") });
    if (minStudents !== undefined) params.append("minStudents", String(minStudents));

    const res = await fetch(`/api/analytics?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur lors de la récupération des données entreprise-filière");
    }

    const result = await res.json();
    return result.data as CompanyFiliereResult;
  } catch (error) {
    console.error("Erreur company-filiere:", error);
    throw error;
  }
};

export const getCompanyLoyalty = async (
  years: string[],
  minYearsActive?: number,
  loyaltyThreshold?: number
) => {
  try {
    const params = new URLSearchParams({ action: "company-loyalty", years: years.join(",") });
    if (minYearsActive !== undefined) params.append("minYearsActive", String(minYearsActive));
    if (loyaltyThreshold !== undefined) params.append("loyaltyThreshold", String(loyaltyThreshold));

    const res = await fetch(`/api/analytics?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur lors de la récupération de la fidélité des entreprises");
    }

    const result = await res.json();
    return result.data as CompanyLoyaltyResult;
  } catch (error) {
    console.error("Erreur company-loyalty:", error);
    throw error;
  }
};

export const getCompanyCapacity = async (years: string[]) => {
  try {
    const params = new URLSearchParams({ action: "company-capacity", years: years.join(",") });

    const res = await fetch(`/api/analytics?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur lors de la récupération de la capacité des entreprises");
    }

    const result = await res.json();
    return result.data as CompanyCapacityResult;
  } catch (error) {
    console.error("Erreur company-capacity:", error);
    throw error;
  }
};

export const getYearComparison = async (years: string[]) => {
  try {
    const params = new URLSearchParams({ action: "year-comparison", years: years.join(",") });

    const res = await fetch(`/api/analytics?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur lors de la comparaison des années");
    }

    const result = await res.json();
    return result.data as YearComparisonResult;
  } catch (error) {
    console.error("Erreur year-comparison:", error);
    throw error;
  }
};