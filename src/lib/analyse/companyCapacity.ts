import Student from '@/models/Student';
import Company from '@/models/Company';
import {CompanyCapacityResult} from './types';

export default async function getCompanyCapacityAnalysis(
  year: string
): Promise<{
  grandesEntreprises: CompanyCapacityResult[];
  moyennesEntreprises: CompanyCapacityResult[];
  petitesEntreprises: CompanyCapacityResult[];
  stats: {
    totalGrandes: number;
    totalMoyennes: number;
    totalPetites: number;
    capaciteTotaleGrandes: number;
    capaciteTotaleMoyennes: number;
    capaciteTotalePetites: number;
  };
}> {
  // Validation
  const validatedParams = { year };

  // Compter les étudiants par entreprise
  const studentCounts = await Student.aggregate([
    { $match: { year: validatedParams.year } },
    { $unwind: '$students' },
    {
      $match: {
        'students.companyId': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$students.companyId',
        nombreEtudiantsReel: { $sum: 1 }
      }
    }
  ]);

  // Créer un map pour accès rapide
  const studentCountMap = new Map(
    studentCounts.map((s: any) => [s._id.toString(), s.nombreEtudiantsReel])
  );

  // Obtenir toutes les entreprises avec leurs infos
  const companies = await Company.aggregate([
    { $match: { year: validatedParams.year } },
    { $unwind: '$companies' },
    {
      $project: {
        _id: '$companies._id',
        nom: '$companies.nom',
        secteur: '$companies.secteur',
        nombreStagiaires: { $ifNull: ['$companies.nombreStagiaires', 1] }
      }
    }
  ]);

  // Calculer les résultats pour chaque entreprise
  const allResults: CompanyCapacityResult[] = companies.map((company: any) => {
    const companyId = company._id.toString();
    const nombreEtudiantsReel = studentCountMap.get(companyId) || 0;
    const capaciteDeclaree = company.nombreStagiaires;
    const tauxOccupation = capaciteDeclaree > 0 
      ? (nombreEtudiantsReel / capaciteDeclaree) * 100 
      : 0;

    let categorie: 'grande' | 'moyenne' | 'petite' = 'petite';
    if (capaciteDeclaree >= 5) categorie = 'grande';
    else if (capaciteDeclaree >= 3) categorie = 'moyenne';

    return {
      companyId,
      companyName: company.nom,
      secteur: company.secteur,
      capaciteDeclaree,
      nombreEtudiantsReel,
      tauxOccupation: Math.round(tauxOccupation * 100) / 100,
      categorie,
      annee: validatedParams.year
    };
  });

  // Séparer par catégorie et trier
  const grandesEntreprises = allResults
    .filter(c => c.categorie === 'grande')
    .sort((a, b) => b.nombreEtudiantsReel - a.nombreEtudiantsReel);

  const moyennesEntreprises = allResults
    .filter(c => c.categorie === 'moyenne')
    .sort((a, b) => b.tauxOccupation - a.tauxOccupation);

  const petitesEntreprises = allResults
    .filter(c => c.categorie === 'petite')
    .sort((a, b) => b.tauxOccupation - a.tauxOccupation);

  // Calculer les statistiques
  const stats = {
    totalGrandes: grandesEntreprises.length,
    totalMoyennes: moyennesEntreprises.length,
    totalPetites: petitesEntreprises.length,
    capaciteTotaleGrandes: grandesEntreprises.reduce((sum, c) => sum + c.nombreEtudiantsReel, 0),
    capaciteTotaleMoyennes: moyennesEntreprises.reduce((sum, c) => sum + c.nombreEtudiantsReel, 0),
    capaciteTotalePetites: petitesEntreprises.reduce((sum, c) => sum + c.nombreEtudiantsReel, 0)
  };

  return {
    grandesEntreprises,
    moyennesEntreprises,
    petitesEntreprises,
    stats
  };
}
