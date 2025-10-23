import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  nom: string;
  secteur: string;
  annee: string;
  adresse?: string;
  contact?: string;
  email?: string;
  telephone?: string;
  nombreStagiaires: number;
  encadrantPro: Array<{
    id: string;
    prenom: string;
    annee: string;
    nombreEtudiants: number;
    categorie: "professionnel";
    email?: string;
    telephone?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  nom: { type: String, required: true },
  secteur: { type: String, required: true },
  annee: { type: String, required: true },
  adresse: { type: String },
  contact: { type: String },
  email: { type: String },
  telephone: { type: String },
  nombreStagiaires: { type: Number, default: 0 },
  encadrantPro: [{
    id: { type: String, required: true },
    prenom: { type: String, required: true },
    annee: { type: String, required: true },
    nombreEtudiants: { type: Number, default: 0 },
    categorie: { type: String, enum: ["professionnel"], required: true },
    email: { type: String },
    telephone: { type: String }
  }]
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
CompanySchema.index({ annee: 1 });
CompanySchema.index({ nom: 1 });
CompanySchema.index({ secteur: 1 });

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
