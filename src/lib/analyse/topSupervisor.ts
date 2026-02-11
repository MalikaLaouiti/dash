import Student from '@/models/Student';
import {TopSupervisorResult} from './types';

export default async function getTopSupervisors(
  year: string,
  categorie?: 'professionnel' | 'academique',
  limit: number = 10
): Promise<TopSupervisorResult[]> {
  
  const validatedParams ={ 
    year, 
    categorie, 
    limit 
  };

  const pipeline: any[] = [
    { $match: { year: validatedParams.year } },
    { $unwind: '$students' },
    
    {
      $addFields: {
        'students.encadreurId': {
          $cond: [
            { $ifNull: ['$students.encadreurAcId', false] },
            '$students.encadreurAcId',
            '$students.encadreurProId'
          ]
        },
        'students.encadreurType': {
          $cond: [
            { $ifNull: ['$students.encadreurAcId', false] },
            'academique',
            'professionnel'
          ]
        }
      }
    },
    
    // Filtrer les étudiants avec encadreur
    {
      $match: {
        'students.encadreurId': { $exists: true, $ne: null }
      }
    },
    
    // Grouper par encadreur
    {
      $group: {
        _id: '$students.encadreurId',
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
        },
        meilleurNote: { $max: '$students.score' }
      }
    },
    
    // Calculer la moyenne
    {
      $project: {
        supervisorId: '$_id',
        nombreEtudiants: 1,
        moyenneNotes: {
          $cond: [
            { $gt: ['$countNotes', 0] },
            { $divide: ['$totalNotes', '$countNotes'] },
            0
          ]
        },
        meilleurNote: { $ifNull: ['$meilleurNote', 0] }
      }
    },
    
    // Joindre avec les infos superviseurs
    {
      $lookup: {
        from: 'supervisors',
        let: { supId: '$supervisorId', yearVar: validatedParams.year },
        pipeline: [
          { $match: { $expr: { $eq: ['$year', '$$yearVar'] } } },
          { $unwind: '$supervisors' },
          { 
            $match: { 
              $expr: { $eq: ['$supervisors._id', '$$supId'] }
            }
          },
          {
            $project: {
              prenom: '$supervisors.prenom',
              email: '$supervisors.email',
              categorie: '$supervisors.categorie'
            }
          }
        ],
        as: 'supervisorInfo'
      }
    },
    
    // Décompresser les infos
    { $unwind: { path: '$supervisorInfo', preserveNullAndEmptyArrays: false } },
    
    // Filtrer par catégorie si demandé
    ...(validatedParams.categorie 
      ? [{ $match: { 'supervisorInfo.categorie': validatedParams.categorie } }] 
      : []),
    
    // Projeter le résultat final
    {
      $project: {
        _id: 0,
        supervisorId: { $toString: '$supervisorId' },
        prenom: '$supervisorInfo.prenom',
        email: { $ifNull: ['$supervisorInfo.email', ''] },
        categorie: '$supervisorInfo.categorie',
        nombreEtudiants: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        meilleurNote: { $round: ['$meilleurNote', 2] },
        annee: { $literal: validatedParams.year }
      }
    },
    
    // Trier
    {
      $sort: {
        nombreEtudiants: -1,
        moyenneNotes: -1
      }
    },
    
    // Limiter
    { $limit: validatedParams.limit }
  ];

  const results = await Student.aggregate(pipeline);
  return results as TopSupervisorResult[];
}
