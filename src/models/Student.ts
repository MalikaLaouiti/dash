import mongoose, { Document, Schema } from 'mongoose';

export interface Student extends Document {
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
  debutStage?: Date;
  finStage?: Date;
  collaboration: "binome" | "monome";
  collaborateur?: {
    codeProjet: string;
    cin: number;
    prenom: string;
    filiere: string;
    annee: string;
    collaboration: "binome";
  };
  ficheInformation?: string;
  cahierCharge?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<Student>({
  codeProjet: { type: String, required: true },
  cin: { type: Number, required: true },
  prenom: { type: String, required: true },
  email: { type: String },
  telephone: { type: String },
  filiere: { type: String, required: true },
  annee: { type: String, required: true },
  titreProjet: { type: String },
  score: { type: Number },
  companyId: { type: String },
  localisation_type: { type: String, enum: ["interne", "externe"] },
  encadreurAcId: { type: String },
  encadreurProId: { type: String },
  dureeStage: { type: String },
  debutStage: { type: Date },
  finStage: { type: Date },
  collaboration: { type: String, enum: ["binome", "monome"], required: true },
  collaborateur: {
    codeProjet: { type: String },
    cin: { type: Number },
    prenom: { type: String },
    filiere: { type: String },
    annee: { type: String },
    collaboration: { type: String, enum: ["binome"] }
  },
  ficheInformation: { type: String },
  cahierCharge: { type: String }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
StudentSchema.index({ annee: 1 });
StudentSchema.index({ cin: 1 });
StudentSchema.index({ score: -1 });
StudentSchema.index({ encadreurAcId: 1 });
StudentSchema.index({ encadreurProId: 1 });

export default mongoose.models.Student || mongoose.model<Student>('Student', StudentSchema);
