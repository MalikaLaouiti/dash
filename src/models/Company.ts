import mongoose from 'mongoose';



const Companies = new mongoose.Schema({
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

const CompanySchema = new mongoose.Schema({
  year: {
    type: String,
    required: true
  },
  companies: {
    type: [Companies],
    default: []
  }
});

CompanySchema.index(
  { nomNormalise: 1, annee: 1 },{ unique: false }
);

CompanySchema.index({ secteur: 1 },{ unique: false });

CompanySchema.index({ nom: 'text', secteur: 'text' },{ unique: false });


if (process.env.NODE_ENV === 'development' && mongoose.models.Company) {
  delete mongoose.models.Company;
}

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
