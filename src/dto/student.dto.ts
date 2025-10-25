export interface StudentDTO {
  codeProjet: string;
  cin: number;
  prenom: string;
  email?: string;
  telephone?: string;
  filiere: string;
  annee: string;
  titreProjet?: string;
  score?: number;
  companyId?: string;
  localisation_type?: "interne" | "externe";
  encadreurAcId?: string;
  encadreurProId?: string;
  dureeStage?: string;
  debutStage?: string;
  finStage?: string;
  collaboration: "binome" | "monome";
  ficheInformation?: string;
  cahierCharge?: string;
  createdAt?: string;
  updatedAt?: string;
}