export type FilterCategorie = 'all' | 'academique' | 'professionnel';
export type SortBy = 'students' | 'moyenne' | 'note';

export interface KpiSuperviseurs {
  totalSuperviseurs: number;
  totalEtudiants: number;
  avgEtudiantsParSuperviseur: string;
  averageMoyenne: string;
  academiqueSupervisors: number;
  topSupervisorId: string | undefined;
  topSupervisorEtudiants: number | undefined;
}

export interface BarChartEntry {
  name: string;
  etudiants: number;
  moyenne: number;
}

export interface ScatterEntry {
  name: string;
  x: number;
  y: number;
  categorie: string;
}
