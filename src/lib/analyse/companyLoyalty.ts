import Company from '@/models/Company';
import {CompanyLoyaltyResult} from './types';
import mongoose from 'mongoose';

export default async function getCompanyLoyaltyAnalysis(
  years: string[],
  minYearsActive: number = 2,
  loyaltyThreshold: number = 2
): Promise<CompanyLoyaltyResult[]> {

  const sortedYears = [...years].sort();
  
  const pipeline: any[] = [
    // 1. Filtrer par années
    { 
      $match: { 
        year: { $in: sortedYears } 
      } 
    },
    
    // 2. Décomposer le tableau companies
    { $unwind: '$companies' },
    
    // 3. S'assurer que l'entreprise a un nom
    {
      $match: {
        'companies.nom': { $exists: true, $ne: null }
      }
    },
    
    // 4. IMPORTANT: Créer un identifiant unique par entreprise
    // Utiliser le nom normalisé comme identifiant car _id est différent par année
    {
      $addFields: {
        // Si nomNormalise existe, l'utiliser, sinon normaliser le nom
        entrepriseKey: {
          $cond: [
            { $ne: ['$companies.nomNormalise', null] },
            '$companies.nomNormalise',
            { 
              $toLower: { 
                $trim: { 
                  input: { $replaceAll: { input: '$companies.nom', find: ' ', replacement: '_' } }
                }
              }
            }
          ]
        }
      }
    },
    
    // 5. Grouper par entreprise (via la clé normalisée) ET année
    {
      $group: {
        _id: {
          companyKey: '$entrepriseKey',
          year: '$year'
        },
        companyId: { $first: '$companies._id' },
        companyName: { $first: '$companies.nom' },
        nombreStagiaires: { $first: '$companies.nombreStagiaires' }
      }
    },
    
    // 6. Pivoter par année
    {
      $group: {
        _id: '$_id.companyKey',
        companyId: { $first: '$companyId' },
        companyName: { $first: '$companyName' },
        ...Object.fromEntries(
          sortedYears.map(year => [
            `annee_${year}`,
            {
              $sum: {
                $cond: [
                  { $eq: ['$_id.year', year] },
                  '$nombreStagiaires',
                  0
                ]
              }
            }
          ])
        )
      }
    },
    
    // 7. Ajouter les métadonnées
    {
      $addFields: {
        companyId: { $toString: '$companyId' },
        companyName: 1,
        
        // Liste des années où l'entreprise est présente
        anneesPresence: {
          $filter: {
            input: sortedYears,
            as: 'year',
            cond: { $gt: [`$annee_${'$$year'}`, 0] }
          }
        },
        
        // Nombre d'années d'activité
        nombreAnnees: {
          $size: {
            $filter: {
              input: sortedYears,
              as: 'year',
              cond: { $gt: [`$annee_${'$$year'}`, 0] }
            }
          }
        },
        
        // Total des stagiaires sur toutes les années
        totalStagiaires: {
          $sum: sortedYears.map(year => `$annee_${year}`)
        }
      }
    },
    
    // 8. Pattern de présence
    {
      $addFields: {
        pattern: {
          $reduce: {
            input: sortedYears,
            initialValue: "",
            in: {
              $concat: [
                "$$value",
                { $cond: [{ $gt: [`$annee_${'$$this'}`, 0] }, "1", "0"] }
              ]
            }
          }
        }
      }
    },
    
    // 9. Score de fidélité
    {
      $addFields: {
        scoreFidelite: {
          $round: [
            { $multiply: [{ $divide: ['$nombreAnnees', sortedYears.length] }, 100] },
            2
          ]
        },
        estFidele: {
          $gte: ['$nombreAnnees', loyaltyThreshold]
        }
      }
    },
    
    // 10. Filtrer par nombre minimum d'années
    { 
      $match: { 
        nombreAnnees: { $gte: minYearsActive } 
      } 
    },
    
    // 11. Formatage final
    {
      $project: {
        _id: 0,
        companyId: 1,
        companyName: 1,
        anneesPresence: 1,
        nombreAnnees: 1,
        pattern: 1,
        stagiaires: {
          $arrayToObject: {
            $map: {
              input: sortedYears,
              as: 'year',
              in: {
                k: '$$year',
                v: { $ifNull: [`$annee_${'$$year'}`, 0] }
              }
            }
          }
        },
        totalStagiaires: 1,
        scoreFidelite: 1,
        estFidele: 1,
        periodeAnalyse: {
          debut: { $arrayElemAt: [sortedYears, 0] },
          fin: { $arrayElemAt: [sortedYears, -1] }
        }
      }
    },
    
    // 12. Tri
    { 
      $sort: { 
        nombreAnnees: -1, 
        totalStagiaires: -1,
        companyName: 1 
      } 
    }
  ];

  const results = await Company.aggregate(pipeline);
  console.log('Pipeline results:', results.length); // Debug
  return results as CompanyLoyaltyResult[];
}