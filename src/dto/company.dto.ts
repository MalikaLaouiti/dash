export interface CompanyDTO {
  nom: string;
  nomNormalise?: string;
  secteur: string;
  adresse?: string;
  // contact?: string;
  email?: string[];
  telephone?: string[];
  annee: number;
  encadrantPro?: string[];
  nombreStagiaires: number;
  lastActivity?: string;
  createdAt?: string;
  updatedAt?: string;

}
