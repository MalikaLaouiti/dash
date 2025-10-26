import mongoose, { Document, Schema } from 'mongoose';


const SupervisorSchema = new Schema({
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

if (process.env.NODE_ENV === 'development' && mongoose.models.Supervisor) {
  delete mongoose.models.Supervisor;
}

export default mongoose.models.Supervisor || mongoose.model('Supervisor', SupervisorSchema);
