import mongoose from 'mongoose';

function normalizeCompanyName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const CompanySchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true 
  },

  nomNormalise: { 
    type: String, 
    required: true,
    lowercase: true 
  },
  
  secteur: { 
    type: String, 
    required: true 
  },
  
  annee: { 
    type: Number, 
    required: true 
  },
  
  adresse: { type: String },
  contact: { type: String },
  email: { type: String },
  telephone: { type: String },
  
  nombreStagiaires: { 
    type: Number, 
    default: 0 
  },
  
  encadrantPro: [{
    type: String
  }],
  
  lastActivity: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true  
});

CompanySchema.index(
  { nomNormalise: 1, annee: 1 }, 
  { unique: true }
);

CompanySchema.index({ secteur: 1 });

CompanySchema.index({ nom: 'text', secteur: 'text' });

CompanySchema.pre('save', function(next) {
  if (this.isModified('nom')) {
    this.nomNormalise = normalizeCompanyName(this.nom);
  }
  next();
});

CompanySchema.pre('findOneAndUpdate', function(next) {
  const update: any = this.getUpdate();
  if (update.$set && update.$set.nom) {
    update.$set.nomNormalise = normalizeCompanyName(update.$set.nom);
  } else if (update.$setOnInsert && update.$setOnInsert.nom) {
    update.$setOnInsert.nomNormalise = normalizeCompanyName(update.$setOnInsert.nom);
  }
  next();
});

if (process.env.NODE_ENV === 'development' && mongoose.models.Company) {
  delete mongoose.models.Company;
}

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
export { normalizeCompanyName };