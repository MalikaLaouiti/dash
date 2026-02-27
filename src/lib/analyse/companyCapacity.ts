import Student from '@/models/Student';
import Company from '@/models/Company';
import {CompanyCapacityResult,CapacityAPIResult} from './types';

export default async function getCompanyCapacityAnalysis(
  year: string
): Promise<CapacityAPIResult> {

  const validatedParams = { year };


  // Obtenir toutes les entreprises avec leurs infos
  const companies = await Company.aggregate([
    { $match: { year: validatedParams.year } },
    { $unwind: '$companies' },
    {
      $project: {
        nom: '$companies.nomNormalise',
        secteur: '$companies.secteur',
        nombreStagiaires: { $ifNull: ['$companies.nombreStagiaires', 1] }
      }
    }
  ]);

  // Calculer les résultats pour chaque entreprise
  const allResults: CompanyCapacityResult[] = companies.map((company: any) => {
    const capaciteDeclaree = company.nombreStagiaires;


    let categorie: 'grande' | 'moyenne' | 'petite' = 'petite';
    if (capaciteDeclaree >= 5) categorie = 'grande';
    else if (capaciteDeclaree >= 3) categorie = 'moyenne';

    return {
      companyName: company.nom,
      secteur: company.secteur,
      capaciteDeclaree,
      categorie,
      annee: validatedParams.year
    };
  });

  // Séparer par catégorie et trier
  const grandesEntreprises = allResults
    .filter(c => c.categorie === 'grande')
    .sort((a, b) => b.capaciteDeclaree - a.capaciteDeclaree);

  const moyennesEntreprises = allResults
    .filter(c => c.categorie === 'moyenne')
    .sort((a, b) => b.capaciteDeclaree - a.capaciteDeclaree);

  const petitesEntreprises = allResults
    .filter(c => c.categorie === 'petite')
    .sort((a, b) => b.capaciteDeclaree - a.capaciteDeclaree);

  // Calculer les statistiques
  const stats = {
    totalGrandes: grandesEntreprises.length,
    totalMoyennes: moyennesEntreprises.length,
    totalPetites: petitesEntreprises.length,
    capaciteTotaleGrandes: grandesEntreprises.reduce((sum, c) => sum + c.capaciteDeclaree, 0),
    capaciteTotaleMoyennes: moyennesEntreprises.reduce((sum, c) => sum + c.capaciteDeclaree, 0),
    capaciteTotalePetites: petitesEntreprises.reduce((sum, c) => sum + c.capaciteDeclaree, 0)
  };

  return {
    grandesEntreprises,
    moyennesEntreprises,
    petitesEntreprises,
    stats
  };
}
