import Student from '@/models/Student';
import Company from '@/models/Company';
import Supervisor from '@/models/Supervisor';
import {YearComparisonResult} from './types';

export default async function getYearOverYearComparison(
  years: string[]
): Promise<YearComparisonResult> {
  // Validation
  const validatedParams = { years };

  // Statistiques étudiants par année
  const studentStats = await Student.aggregate([
    { $match: { year: { $in: validatedParams.years } } },
    {
      $project: {
        year: 1,
        totalEtudiants: { $size: '$students' },
        students: 1
      }
    },
    { $unwind: { path: '$students', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$year',
        totalEtudiants: { $max: '$totalEtudiants' },
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
    {
      $project: {
        _id: 0,
        annee: '$_id',
        totalEtudiants: 1,
        moyenneNotesGlobale: {
          $cond: [
            { $gt: ['$countNotes', 0] },
            { $round: [{ $divide: ['$totalNotes', '$countNotes'] }, 2] },
            0
          ]
        }
      }
    },
    { $sort: { annee: 1 } }
  ]);

  // Statistiques entreprises par année
  const companyStats = await Company.aggregate([
    { $match: { year: { $in: validatedParams.years } } },
    {
      $project: {
        year: 1,
        totalEntreprises: { $size: '$companies' }
      }
    },
    {
      $group: {
        _id: '$year',
        totalEntreprises: { $first: '$totalEntreprises' }
      }
    },
    {
      $project: {
        _id: 0,
        annee: '$_id',
        totalEntreprises: 1
      }
    },
    { $sort: { annee: 1 } }
  ]);

  // Statistiques encadrants par année
  const supervisorStats = await Supervisor.aggregate([
    { $match: { year: { $in: validatedParams.years } } },
    {
      $project: {
        year: 1,
        totalEncadrants: { $size: '$supervisors' }
      }
    },
    {
      $group: {
        _id: '$year',
        totalEncadrants: { $first: '$totalEncadrants' }
      }
    },
    {
      $project: {
        _id: 0,
        annee: '$_id',
        totalEncadrants: 1
      }
    },
    { $sort: { annee: 1 } }
  ]);

  // Créer des maps pour faciliter la fusion
  const companyMap = new Map(companyStats.map((c: any) => [c.annee, c.totalEntreprises]));
  const supervisorMap = new Map(supervisorStats.map((s: any) => [s.annee, s.totalEncadrants]));

  // Fusionner toutes les données
  const sortedYears = [...validatedParams.years].sort();
  const parAnnee = sortedYears.map(year => {
    const studentData = studentStats.find((s: any) => s.annee === year);
    
    return {
      annee: year,
      totalEtudiants: studentData?.totalEtudiants || 0,
      totalEntreprises: companyMap.get(year) || 0,
      totalEncadrants: supervisorMap.get(year) || 0,
      moyenneNotesGlobale: studentData?.moyenneNotesGlobale || 0
    };
  });

  // Calculer les tendances
  const tendances = {
    croissanceEtudiants: 0,
    croissanceEntreprises: 0,
    evolutionNotes: 0
  };

  if (parAnnee.length >= 2) {
    const first = parAnnee[0];
    const last = parAnnee[parAnnee.length - 1];

    if (first.totalEtudiants > 0) {
      tendances.croissanceEtudiants = 
        Math.round(((last.totalEtudiants - first.totalEtudiants) / first.totalEtudiants) * 10000) / 100;
    }

    if (first.totalEntreprises > 0) {
      tendances.croissanceEntreprises = 
        Math.round(((last.totalEntreprises - first.totalEntreprises) / first.totalEntreprises) * 10000) / 100;
    }

    if (first.moyenneNotesGlobale > 0) {
      tendances.evolutionNotes = 
        Math.round(((last.moyenneNotesGlobale - first.moyenneNotesGlobale) / first.moyenneNotesGlobale) * 10000) / 100;
    }
  }

  return { parAnnee, tendances };
}