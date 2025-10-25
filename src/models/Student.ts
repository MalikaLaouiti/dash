import mongoose, { Document,SchemaTypes ,Schema } from 'mongoose';
import Company from './Company';

// export interface Student extends Document {
//   codeProjet: string;
//   cin: number;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   filiere: string;
//   annee: string;
//   titreProjet?: string;
//   score?: number;
//   companyId?: string;
//   localisation_type?: "interne" | "externe";
//   encadreurAcId?: string;
//   encadreurProId?: string;
//   dureeStage?: string;
//   debutStage?: Date;
//   finStage?: Date;
//   collaboration: "binome" | "monome";
//   collaborateur?: {
//     codeProjet: string;
//     cin: number;
//     prenom: string;
//     filiere: string;
//     annee: string;
//     collaboration: "binome";
//   };
//   ficheInformation?: string;
//   cahierCharge?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

const StudentSchema = new Schema({
  codeProjet: { type: String, required: true },
  cin: { type: Number, required: true ,unique:true},
  prenom: { type: String, required: true },
  email: { type: String },
  telephone: { type: String },
  filiere: { type: String, required: true },
  annee: { type: String, required: true },
  titreProjet: { type: String },
  score: { type: Number },
  companyId: { 
    type: SchemaTypes.ObjectId,
    ref: 'Company'
   },
  localisation_type: { type: String, enum: ["interne", "externe"] },
  encadreurAcId: { 
    type: SchemaTypes.ObjectId,
    ref:"Supervisor"
   },
  encadreurProId: { 
    type: SchemaTypes.ObjectId,
    ref:"Supervisor" },
  dureeStage: { type: String },
  debutStage: { type: Date },
  finStage: { type: Date },
  collaboration: { type: String, enum: ["binome", "monome"], required: true },
  collaborateur: {
    type:SchemaTypes.ObjectId, 
    ref: 'Student',
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

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
