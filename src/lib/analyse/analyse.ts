// lib/analyse/analyse.ts

import mongoose from 'mongoose';
import Student from '@/models/Student';
import Company from '@/models/Company';
import Supervisor from '@/models/Supervisor';
import {
  TopSupervisorResult,
  CompanyFiliereResult,
  CompanyLoyaltyResult,
  CompanyCapacityResult,
  YearComparisonResult,
  AggregationResult,
  SupervisorInfo,
  CompanyInfo,
  SupervisorStatsMap,
  SupervisorStatsData
} from './types';



export async function getTopSupervisors(
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

// ============================================
// 2. COMPANY FILIERE ANALYSIS
// ============================================

export async function getCompanyFiliereAnalysis(
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


export async function getCompanyLoyaltyAnalysis(
  years: string[],
  minYearsActive: number = 2,
  loyaltyThreshold: number = 2
): Promise<CompanyLoyaltyResult[]> {
  // Validation
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

// ============================================
// 4. COMPANY CAPACITY ANALYSIS
// ============================================

export async function getCompanyCapacityAnalysis(
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

export async function getYearOverYearComparison(
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

// Export de toutes les fonctions
export default {
  getTopSupervisors,
  getCompanyFiliereAnalysis,
  getCompanyLoyaltyAnalysis,
  getCompanyCapacityAnalysis,
  getYearOverYearComparison
};