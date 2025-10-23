import mongoose, { Document, Schema } from 'mongoose';

export interface Supervisor extends Document {
  prenom: string;
  email?: string;
  telephone?: string;
  nombreEtudiants: number;
  annee: string;
  categorie: "professionnel" | "academique";
  createdAt: Date;
  updatedAt: Date;
}

const SupervisorSchema = new Schema<Supervisor>({
  prenom: { type: String, required: true },
  email: { type: String },
  telephone: { type: String },
  nombreEtudiants: { type: Number, default: 0 },
  annee: { type: String, required: true },
  categorie: { type: String, enum: ["professionnel", "academique"], required: true }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
SupervisorSchema.index({ annee: 1 });
SupervisorSchema.index({ categorie: 1 });
SupervisorSchema.index({ prenom: 1 });
SupervisorSchema.index({ nombreEtudiants: -1 });

export default mongoose.models.Supervisor || mongoose.model<Supervisor>('Supervisor', SupervisorSchema);
