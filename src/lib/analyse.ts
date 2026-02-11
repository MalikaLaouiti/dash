import mongoose from 'mongoose';
import Student from '@/models/Student';
import Company from '@/models/Company';
import Supervisor from '@/models/Supervisor';

interface TopSupervisorResult {
  supervisorId: string;
  prenom: string;
  email: string;
  categorie: 'professionnel' | 'academique';
  nombreEtudiants: number;
  moyenneNotes: number;
  meilleurNote: number;
  annee: string;
}

export async function getTopSupervisors(
  year: string,
  categorie?: 'professionnel' | 'academique',
  limit: number = 10
): Promise<TopSupervisorResult[]> {
  // Aggregation pour les encadrants académiques
  const academicPipeline: any[] = [
    { $match: { year } },
    { $unwind: '$students' },
    { $match: { 'students.encadreurAcId': { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$students.encadreurAcId',
        nombreEtudiants: { $sum: 1 },
        totalNotes: { 
          $sum: { 
            $cond: [{ $ifNull: ['$students.score', false] }, '$students.score', 0] 
          } 
        },
        countNotes: { 
          $sum: { 
            $cond: [{ $ifNull: ['$students.score', false] }, 1, 0] 
          } 
        },
        meilleurNote: { $max: '$students.score' }
      }
    },
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
    }
  ];

  // Aggregation pour les encadrants professionnels
  const professionalPipeline: any[] = [
    { $match: { year } },
    { $unwind: '$students' },
    { $match: { 'students.encadreurProId': { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$students.encadreurProId',
        nombreEtudiants: { $sum: 1 },
        totalNotes: { 
          $sum: { 
            $cond: [{ $ifNull: ['$students.score', false] }, '$students.score', 0] 
          } 
        },
        countNotes: { 
          $sum: { 
            $cond: [{ $ifNull: ['$students.score', false] }, 1, 0] 
          } 
        },
        meilleurNote: { $max: '$students.score' }
      }
    },
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
    }
  ];

  // Exécuter les aggregations
  const [academicResults, professionalResults] = await Promise.all([
    Student.aggregate(academicPipeline),
    Student.aggregate(professionalPipeline)
  ]);

  // Combiner les résultats
  const supervisorStatsMap = new Map();

  academicResults.forEach((result: any) => {
    supervisorStatsMap.set(result.supervisorId, {
      ...result,
      type: 'academique'
    });
  });

  professionalResults.forEach((result: any) => {
    const existing = supervisorStatsMap.get(result.supervisorId);
    if (existing) {
      // L'encadrant est à la fois académique et professionnel
      existing.nombreEtudiants += result.nombreEtudiants;
      const totalNotes = (existing.moyenneNotes * existing.nombreEtudiants + result.moyenneNotes * result.nombreEtudiants);
      existing.moyenneNotes = totalNotes / existing.nombreEtudiants;
      existing.meilleurNote = Math.max(existing.meilleurNote, result.meilleurNote);
    } else {
      supervisorStatsMap.set(result.supervisorId, {
        ...result,
        type: 'professionnel'
      });
    }
  });

  // Récupérer les informations des superviseurs
  const supervisorIds = Array.from(supervisorStatsMap.keys());
  
  const supervisorInfo = await Supervisor.aggregate([
    { $match: { year } },
    { $unwind: '$supervisors' },
    { 
      $match: { 
        'supervisors._id': { $in: supervisorIds.map(id => new mongoose.Types.ObjectId(id)) }
      } 
    },
    {
      $project: {
        _id: '$supervisors._id',
        prenom: '$supervisors.prenom',
        email: '$supervisors.email',
        categorie: '$supervisors.categorie'
      }
    }
  ]);

  // Créer un map des informations superviseurs
  const supervisorInfoMap = new Map(
    supervisorInfo.map((sup: any) => [sup._id.toString(), sup])
  );

  // Combiner les stats avec les infos
  const results: TopSupervisorResult[] = Array.from(supervisorStatsMap.entries())
    .map(([supervisorId, stats]) => {
      const info = supervisorInfoMap.get(supervisorId);
      if (!info) return null;
      
      // Filtrer par catégorie si spécifié
      if (categorie && info.categorie !== categorie) return null;

      return {
        supervisorId,
        prenom: info.prenom,
        email: info.email || '',
        categorie: info.categorie,
        nombreEtudiants: stats.nombreEtudiants,
        moyenneNotes: stats.moyenneNotes,
        meilleurNote: stats.meilleurNote,
        annee: year
      };
    })
    .filter((r): r is TopSupervisorResult => r !== null)
    .sort((a, b) => {
      if (b.nombreEtudiants !== a.nombreEtudiants) {
        return b.nombreEtudiants - a.nombreEtudiants;
      }
      return b.moyenneNotes - a.moyenneNotes;
    })
    .slice(0, limit);

  return results;
}


interface CompanyFiliereResult {
  companyId: string;
  companyName: string;
  secteur: string;
  filieres: {
    filiere: string;
    nombreEtudiants: number;
    moyenneNotes: number;
  }[];
  totalEtudiants: number;
  annee: string;
}

export async function getCompanyFiliereAnalysis(
  year: string,
  minStudents: number = 1
): Promise<CompanyFiliereResult[]> {
  // Aggregation pour obtenir les stats étudiants par entreprise et filière
  const studentStats = await Student.aggregate([
    { $match: { year } },
    { $unwind: '$students' },
    { 
      $match: { 
        'students.companyId': { $exists: true, $ne: null } 
      } 
    },
    {
      $group: {
        _id: {
          companyId: '$students.companyId',
          filiere: '$students.filiere'
        },
        nombreEtudiants: { $sum: 1 },
        totalNotes: {
          $sum: {
            $cond: [{ $ifNull: ['$students.score', false] }, '$students.score', 0]
          }
        },
        countNotes: {
          $sum: {
            $cond: [{ $ifNull: ['$students.score', false] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        companyId: '$_id.companyId',
        filiere: '$_id.filiere',
        nombreEtudiants: 1,
        moyenneNotes: {
          $cond: [
            { $gt: ['$countNotes', 0] },
            { $divide: ['$totalNotes', '$countNotes'] },
            0
          ]
        }
      }
    }
  ]);

  // Aggregation pour obtenir le total par entreprise
  const companyTotals = await Student.aggregate([
    { $match: { year } },
    { $unwind: '$students' },
    { 
      $match: { 
        'students.companyId': { $exists: true, $ne: null } 
      } 
    },
    {
      $group: {
        _id: '$students.companyId',
        totalEtudiants: { $sum: 1 }
      }
    },
    {
      $match: {
        totalEtudiants: { $gte: minStudents }
      }
    }
  ]);

  // Récupérer les infos des entreprises
  const companyIds = companyTotals.map((c: any) => new mongoose.Types.ObjectId(c._id));
  
  const companyInfo = await Company.aggregate([
    { $match: { year } },
    { $unwind: '$companies' },
    {
      $match: {
        'companies._id': { $in: companyIds }
      }
    },
    {
      $project: {
        _id: '$companies._id',
        nom: '$companies.nom',
        secteur: '$companies.secteur'
      }
    }
  ]);

  // Créer des maps pour faciliter le traitement
  const companyInfoMap = new Map(
    companyInfo.map((c: any) => [c._id.toString(), c])
  );

  const companyTotalsMap = new Map(
    companyTotals.map((c: any) => [c._id, c.totalEtudiants])
  );

  // Grouper les filières par entreprise
  const companyFiliereMap = new Map<string, any[]>();
  
  studentStats.forEach((stat: any) => {
    const companyId = stat.companyId;
    if (!companyTotalsMap.has(companyId)) return; // Filtrer par minStudents
    
    if (!companyFiliereMap.has(companyId)) {
      companyFiliereMap.set(companyId, []);
    }
    
    companyFiliereMap.get(companyId)!.push({
      filiere: stat.filiere,
      nombreEtudiants: stat.nombreEtudiants,
      moyenneNotes: stat.moyenneNotes
    });
  });

  // Construire les résultats
  const results: CompanyFiliereResult[] = Array.from(companyFiliereMap.entries())
    .map(([companyId, filieres]) => {
      const info = companyInfoMap.get(companyId);
      if (!info) return null;

      // Trier les filières par nombre d'étudiants
      filieres.sort((a, b) => b.nombreEtudiants - a.nombreEtudiants);

      return {
        companyId,
        companyName: info.nom,
        secteur: info.secteur,
        filieres,
        totalEtudiants: companyTotalsMap.get(companyId) || 0,
        annee: year
      };
    })
    .filter((r): r is CompanyFiliereResult => r !== null)
    .sort((a, b) => b.totalEtudiants - a.totalEtudiants);

  return results;
}

/**
 * 3. SATISFACTION IMPLICITE
 */

interface CompanyLoyaltyResult {
  companyName: string;
  secteur: string;
  anneesPresence: string[];
  evolution: {
    annee: string;
    nombreEtudiants: number;
  }[];
  tauxCroissance: number;
  estFidele: boolean;
  tendance: 'croissante' | 'stable' | 'décroissante';
}

/**
 * Identifie les entreprises fidèles qui reprennent des stagiaires
 * @param years - Tableau d'années à analyser (minimum 2)
 */
export async function getCompanyLoyaltyAnalysis(
  years: string[]
): Promise<CompanyLoyaltyResult[]> {
  if (years.length < 2) {
    throw new Error('Au moins 2 années sont nécessaires pour l\'analyse de fidélité');
  }

  // Aggregation pour compter les étudiants par entreprise et année
  const studentsByCompany = await Student.aggregate([
    { $match: { year: { $in: years } } },
    { $unwind: '$students' },
    {
      $match: {
        'students.companyId': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: {
          year: '$year',
          companyId: '$students.companyId'
        },
        nombreEtudiants: { $sum: 1 }
      }
    },
    {
      $project: {
        year: '$_id.year',
        companyId: '$_id.companyId',
        nombreEtudiants: 1,
        _id: 0
      }
    }
  ]);

  // Récupérer toutes les entreprises concernées
  const allCompanyIds = [...new Set(studentsByCompany.map((s: any) => s.companyId))];
  const companyObjectIds = allCompanyIds.map(id => new mongoose.Types.ObjectId(id));

  const companiesInfo = await Company.aggregate([
    { $match: { year: { $in: years } } },
    { $unwind: '$companies' },
    {
      $match: {
        'companies._id': { $in: companyObjectIds }
      }
    },
    {
      $group: {
        _id: '$companies._id',
        nom: { $first: '$companies.nom' },
        nomNormalise: { $first: '$companies.nomNormalise' },
        secteur: { $first: '$companies.secteur' }
      }
    }
  ]);

  // Créer un map pour normaliser les noms d'entreprises
  const companyNormMap = new Map();
  companiesInfo.forEach((company: any) => {
    const normalizedName = company.nomNormalise || company.nom.toLowerCase().trim();
    if (!companyNormMap.has(normalizedName)) {
      companyNormMap.set(normalizedName, {
        nom: company.nom,
        secteur: company.secteur,
        ids: []
      });
    }
    companyNormMap.get(normalizedName).ids.push(company._id.toString());
  });

  // Grouper les données par entreprise normalisée
  const companyEvolution = new Map<string, Map<string, number>>();

  studentsByCompany.forEach((record: any) => {
    const company = companiesInfo.find((c: any) => c._id.toString() === record.companyId);
    if (!company) return;

    const normalizedName = company.nomNormalise || company.nom.toLowerCase().trim();
    
    if (!companyEvolution.has(normalizedName)) {
      companyEvolution.set(normalizedName, new Map());
    }

    const yearMap = companyEvolution.get(normalizedName)!;
    yearMap.set(
      record.year,
      (yearMap.get(record.year) || 0) + record.nombreEtudiants
    );
  });

  // Construire les résultats
  const results: CompanyLoyaltyResult[] = Array.from(companyEvolution.entries())
    .map(([normalizedName, yearMap]) => {
      const companyData = companyNormMap.get(normalizedName);
      const anneesPresence = Array.from(yearMap.keys()).sort();

      // Filtrer les entreprises présentes moins de 2 ans
      if (anneesPresence.length < 2) return null;

      const evolution = anneesPresence.map(annee => ({
        annee,
        nombreEtudiants: yearMap.get(annee) || 0
      }));

      // Calculer le taux de croissance moyen
      let tauxCroissance = 0;
      if (evolution.length > 1) {
        const croissances = [];
        for (let i = 1; i < evolution.length; i++) {
          const prev = evolution[i - 1].nombreEtudiants;
          const curr = evolution[i].nombreEtudiants;
          if (prev > 0) {
            croissances.push(((curr - prev) / prev) * 100);
          }
        }
        tauxCroissance = croissances.length > 0
          ? croissances.reduce((a, b) => a + b, 0) / croissances.length
          : 0;
      }

      // Vérifier si les années sont consécutives
      const estFidele = anneesPresence.some((year, idx) => {
        if (idx === 0) return false;
        const prevYear = parseInt(anneesPresence[idx - 1]);
        const currYear = parseInt(year);
        return currYear - prevYear === 1;
      });

      // Déterminer la tendance
      let tendance: 'croissante' | 'stable' | 'décroissante' = 'stable';
      if (tauxCroissance > 5) tendance = 'croissante';
      else if (tauxCroissance < -5) tendance = 'décroissante';

      return {
        companyName: companyData.nom,
        secteur: companyData.secteur,
        anneesPresence,
        evolution,
        tauxCroissance,
        estFidele,
        tendance
      };
    })
    .filter((r): r is CompanyLoyaltyResult => r !== null)
    .sort((a, b) => {
      // Trier par fidélité, puis par taux de croissance
      if (a.estFidele !== b.estFidele) {
        return a.estFidele ? -1 : 1;
      }
      return b.tauxCroissance - a.tauxCroissance;
    });

  return results;
}

/**
 * 4. CAPACITÉ D'ACCUEIL
 */

interface CompanyCapacityResult {
  companyId: string;
  companyName: string;
  secteur: string;
  capaciteDeclaree: number;
  nombreEtudiantsReel: number;
  tauxOccupation: number;
  categorie: 'grande' | 'moyenne' | 'petite';
  annee: string;
}

/**
 * Analyse la capacité d'accueil des entreprises
 * @param year - Année à analyser
 */
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
  // Aggregation pour compter les étudiants par entreprise
  const studentCounts = await Student.aggregate([
    { $match: { year } },
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
    studentCounts.map((s: any) => [s._id, s.nombreEtudiantsReel])
  );

  // Aggregation pour obtenir toutes les entreprises avec leurs infos
  const companies = await Company.aggregate([
    { $match: { year } },
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
    const tauxOccupation = (nombreEtudiantsReel / capaciteDeclaree) * 100;

    let categorie: 'grande' | 'moyenne' | 'petite' = 'petite';
    if (capaciteDeclaree >= 5) categorie = 'grande';
    else if (capaciteDeclaree >= 3) categorie = 'moyenne';

    return {
      companyId,
      companyName: company.nom,
      secteur: company.secteur,
      capaciteDeclaree,
      nombreEtudiantsReel,
      tauxOccupation,
      categorie,
      annee: year
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

  // Calculer les statistiques avec aggregation
  const statsAgg = await Company.aggregate([
    { $match: { year } },
    { $unwind: '$companies' },
    {
      $project: {
        _id: '$companies._id',
        nombreStagiaires: { $ifNull: ['$companies.nombreStagiaires', 1] },
        categorie: {
          $cond: [
            { $gte: [{ $ifNull: ['$companies.nombreStagiaires', 1] }, 5] },
            'grande',
            {
              $cond: [
                { $gte: [{ $ifNull: ['$companies.nombreStagiaires', 1] }, 3] },
                'moyenne',
                'petite'
              ]
            }
          ]
        }
      }
    },
    {
      $group: {
        _id: '$categorie',
        count: { $sum: 1 }
      }
    }
  ]);

  const statsMap = new Map(statsAgg.map((s: any) => [s._id, s.count]));

  const stats = {
    totalGrandes: statsMap.get('grande') || 0,
    totalMoyennes: statsMap.get('moyenne') || 0,
    totalPetites: statsMap.get('petite') || 0,
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

/**
 * FONCTION BONUS: Analyse comparative multi-années
 */
export async function getYearOverYearComparison(years: string[]): Promise<{
  parAnnee: {
    annee: string;
    totalEtudiants: number;
    totalEntreprises: number;
    totalEncadrants: number;
    moyenneNotesGlobale: number;
  }[];
  tendances: {
    croissanceEtudiants: number;
    croissanceEntreprises: number;
    evolutionNotes: number;
  };
}> {
  // Aggregation pour les statistiques étudiants par année
  const studentStats = await Student.aggregate([
    { $match: { year: { $in: years } } },
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
            $cond: [{ $ifNull: ['$students.score', false] }, '$students.score', 0]
          }
        },
        countNotes: {
          $sum: {
            $cond: [{ $ifNull: ['$students.score', false] }, 1, 0]
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
            { $divide: ['$totalNotes', '$countNotes'] },
            0
          ]
        }
      }
    },
    { $sort: { annee: 1 } }
  ]);

  // Aggregation pour les entreprises par année
  const companyStats = await Company.aggregate([
    { $match: { year: { $in: years } } },
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

  // Aggregation pour les encadrants par année
  const supervisorStats = await Supervisor.aggregate([
    { $match: { year: { $in: years } } },
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
  const parAnnee = years.sort().map(year => {
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
        ((last.totalEtudiants - first.totalEtudiants) / first.totalEtudiants) * 100;
    }

    if (first.totalEntreprises > 0) {
      tendances.croissanceEntreprises = 
        ((last.totalEntreprises - first.totalEntreprises) / first.totalEntreprises) * 100;
    }

    if (first.moyenneNotesGlobale > 0) {
      tendances.evolutionNotes = 
        ((last.moyenneNotesGlobale - first.moyenneNotesGlobale) / first.moyenneNotesGlobale) * 100;
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