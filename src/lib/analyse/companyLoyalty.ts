import Student from '@/models/Student';
import {CompanyLoyaltyResult} from './types';

export default async function getCompanyLoyaltyAnalysis(
  years: string[],
  minYearsActive: number = 2,
  loyaltyThreshold: number = 2
): Promise<CompanyLoyaltyResult[]> {
  const validatedParams = { 
    years, 
    minYearsActive, 
    loyaltyThreshold 
  };

  // Pipeline pour chaque année
  const pipeline: any[] = [
    { $match: { year: { $in: validatedParams.years } } },
    { $unwind: '$students' },
    {
      $match: {
        'students.companyId': { $exists: true, $ne: null }
      }
    },
    
    // Grouper par entreprise et année
    {
      $group: {
        _id: {
          companyId: '$students.companyId',
          year: '$year'
        },
        nombreEtudiants: { $sum: 1 }
      }
    },
    
    // Grouper par entreprise pour obtenir toutes les années
    {
      $group: {
        _id: '$_id.companyId',
        anneesActivite: { $addToSet: '$_id.year' },
        totalEtudiantsAccueillis: { $sum: '$nombreEtudiants' }
      }
    },
    
    // Calculer le nombre d'années et le statut de fidélité
    {
      $addFields: {
        nombreAnneesActive: { $size: '$anneesActivite' },
        estFidele: { 
          $gte: [{ $size: '$anneesActivite' }, validatedParams.loyaltyThreshold] 
        },
        tauxRetention: {
          $multiply: [
            { 
              $divide: [
                { $size: '$anneesActivite' }, 
                validatedParams.years.length
              ] 
            },
            100
          ]
        }
      }
    },
    
    // Filtrer par nombre minimum d'années
    {
      $match: {
        nombreAnneesActive: { $gte: validatedParams.minYearsActive }
      }
    },
    
    // Joindre avec les infos entreprises (prendre la première année trouvée)
    {
      $lookup: {
        from: 'companies',
        let: { compId: '$_id', yearsArray: '$anneesActivite' },
        pipeline: [
          { $match: { $expr: { $in: ['$year', '$$yearsArray'] } } },
          { $unwind: '$companies' },
          { 
            $match: { 
              $expr: { $eq: ['$companies._id', '$$compId'] }
            }
          },
          { $limit: 1 },
          {
            $project: {
              nom: '$companies.nom',
              secteur: '$companies.secteur'
            }
          }
        ],
        as: 'companyInfo'
      }
    },
    
    { $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: false } },
    
    // Projeter le résultat final
    {
      $project: {
        _id: 0,
        companyId: { $toString: '$_id' },
        companyName: '$companyInfo.nom',
        secteur: '$companyInfo.secteur',
        anneesActivite: 1,
        nombreAnneesActive: 1,
        totalEtudiantsAccueillis: 1,
        estFidele: 1,
        tauxRetention: { $round: ['$tauxRetention', 2] }
      }
    },
    
    // Trier
    {
      $sort: {
        nombreAnneesActive: -1,
        totalEtudiantsAccueillis: -1
      }
    }
  ];

  const results = await Student.aggregate(pipeline);
  return results as CompanyLoyaltyResult[];
}