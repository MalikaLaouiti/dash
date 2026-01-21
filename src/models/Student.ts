import mongoose, { Schema } from 'mongoose';

const students = new Schema({
  codeProjet: { type: String, required: true },
  cin: { type: Number, required: true },
  prenom: { type: String, required: true },
  email: { type: String },
  telephone: { type: String },
  filiere: { type: String, required: true },
  annee: { type: String, required: true },
  titreProjet: { type: String },
  score: { type: Number },
  companyId: { 
    type: String
   },
  localisation_type: { type: String, enum: ["interne", "externe"] },
  encadreurAcId: { 
    type: String
   },
  encadreurProId: { 
    type: String
    },
  dureeStage: { type: String },
  debutStage: { type: Date },
  finStage: { type: Date },
  collaboration: { type: String, enum: ["binome", "monome"], required: true },
  collaborateur: {
    type:String
  },
  ficheInformation: { type: String },
  cahierCharge: { type: String }
}
);

const StudentSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true
  },
  students: {
    type: [students],
    default: [] 
  }
});


// Index pour optimiser les requêtes
StudentSchema.index({ annee: 1 });
StudentSchema.index({ cin: 1 });
StudentSchema.index({ score: -1 });
StudentSchema.index({ encadreurAcId: 1 });
StudentSchema.index({ encadreurProId: 1 });


if (process.env.NODE_ENV === 'development' && mongoose.models.Student) {
  delete mongoose.models.Student;
}


export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
