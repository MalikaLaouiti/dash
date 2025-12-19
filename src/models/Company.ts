import mongoose from 'mongoose';

function normalizeCompanyName(name: string): string {
  if (!name) return '';
  
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/[\t\s+ ']/g, '')
    .replace(/\s+/g, '')
    .trim();
}

const CompanySchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true 
  },

  nomNormalise: { 
    type: String, 
    required: false,
  },
  
  secteur: { 
    type: String, 
    required: true 
  },
  
  annee: { 
    type: String, 
    required: true 
  },
  
  adresse: { type: String },
  email: [{ type: String }],
  telephone: [{ type: String }],
  
  nombreStagiaires: { 
    type: Number, 
    default: 1 
  },
  
  encadrantPro: [{
    type: String
  }],
  
  lastActivity: { 
    type: Date, 
    default: Date.now 
  }
 
});

CompanySchema.index(
  { nomNormalise: 1, annee: 1 },{ unique: false }
);

CompanySchema.index({ secteur: 1 },{ unique: false });

CompanySchema.index({ nom: 'text', secteur: 'text' },{ unique: false });

// CompanySchema.pre('save', function(next) {
//   if (this.isModified('nom')) {
//     this.nomNormalise = normalizeCompanyName(this.nom);
//   }
//   next();
// });

// CompanySchema.pre('findOneAndUpdate', function(next) {
//   const update: any = this.getUpdate();
//   if (update.$set && update.$set.nom) {
//     update.$set.nomNormalise = normalizeCompanyName(update.$set.nom);
//   } else if (update.$setOnInsert && update.$setOnInsert.nom) {
//     update.$setOnInsert.nomNormalise = normalizeCompanyName(update.$setOnInsert.nom);
//   }
//   next();
// });

if (process.env.NODE_ENV === 'development' && mongoose.models.Company) {
  delete mongoose.models.Company;
}

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
export { normalizeCompanyName };