import Student from '@/models/Student';
import {CompanyFiliereResult} from './types';

export default async function getCompanyFiliereAnalysis(
  year: string,
  minStudents: number = 1
): Promise<CompanyFiliereResult[]> {
  // Validation
  const validatedParams = { year, minStudents };

  // Pipeline optimisé avec lookup
  const pipeline: any[] = [
    { $match: { year: validatedParams.year } },
    { $unwind: '$students' },
    { 
      $match: { 
        'students.companyId': { $exists: true, $ne: null },
        'students.filiere': { $exists: true, $ne: null }
      } 
    },
    
    // Grouper par entreprise et filière
    {
      $group: {
        _id: {
          companyId: '$students.companyId',
          filiere: '$students.filiere'
        },
        nombreEtudiants: { $sum: 1 },
        totalNotes: {
          $sum: {
            $cond: [
              { $and: [
                { $ifNull: ['$students.score', false] },
                { $gte: ['$students.score', 0] }
              ]}, 
              '$students.score', 
              0
            ]
          }
        },
        countNotes: {
          $sum: {
            $cond: [
              { $and: [
                { $ifNull: ['$students.score', false] },
                { $gte: ['$students.score', 0] }
              ]}, 
              1, 
              0
            ]
          }
        }
      }
    },
    
    // Calculer la moyenne par filière
    {
      $project: {
        companyId: '$_id.companyId',
        filiere: '$_id.filiere',
        nombreEtudiants: 1,
        moyenneNotes: {
          $cond: [
            { $gt: ['$countNotes', 0] },
            { $round: [{ $divide: ['$totalNotes', '$countNotes'] }, 2] },
            0
          ]
        }
      }
    },
    
    // Grouper par entreprise pour obtenir toutes les filières
    {
      $group: {
        _id: '$companyId',
        totalEtudiants: { $sum: '$nombreEtudiants' },
        filieres: {
          $push: {
            filiere: '$filiere',
            nombreEtudiants: '$nombreEtudiants',
            moyenneNotes: '$moyenneNotes'
          }
        }
      }
    },
    
    // Filtrer par nombre minimum d'étudiants
    {
      $match: {
        totalEtudiants: { $gte: validatedParams.minStudents }
      }
    },
    
    // Joindre avec les infos entreprises
    {
      $lookup: {
        from: 'companies',
        let: { compId: '$_id', yearVar: validatedParams.year },
        pipeline: [
          { $match: { $expr: { $eq: ['$year', '$$yearVar'] } } },
          { $unwind: '$companies' },
          { 
            $match: { 
              $expr: { $eq: ['$companies._id', '$$compId'] }
            }
          },
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
        filieres: 1,
        totalEtudiants: 1,
        annee: { $literal: validatedParams.year }
      }
    },
    
    // Trier par nombre total d'étudiants
    {
      $sort: { totalEtudiants: -1 }
    }
  ];

  const results = await Student.aggregate(pipeline);
  return results as CompanyFiliereResult[];
}