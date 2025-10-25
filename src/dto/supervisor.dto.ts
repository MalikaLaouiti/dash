export interface SupervisorDTO {
  _id: string;
  prenom: string;
  email?: string;
  telephone?: string;
  annee: string;
  categorie: "professionnel" | "academique";
  nombreEtudiants?: number;
  createdAt?: string;
  updatedAt?: string;
}