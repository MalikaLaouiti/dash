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

const results = await Student.aggregate([
  {
    $match: {
      year: validatedParams.year,
    }
  },
  {
    $unwind: "$students"
  },
  {
    $group: {
      _id: "$students.encadreurAcId",
      notes: { $push: "$students.score" },
      moyenne: { $avg: "$students.score" },
      mediane: { $avg: "$students.score" }, // approximation
      meilleureNote: { $max: "$students.score" },
      pireNote: { $min: "$students.score" },
      nbExcellent: {
        $sum: { $cond: [{ $gte: ["$students.score", 18] }, 1, 0] }
      },
      nbTresBien: {
        $sum: { $cond: [{ $gte: ["$students.score", 16] }, 1, 0] }
      },
      nbEtudiants: { $sum: 1 }
    }
  },
  {
    $project: {
      notes: 1,
      moyenne: { $round: ["$moyenne", 2] },
      meilleureNote: 1,
      pireNote: 1,
      nbExcellent: 1,
      nbTresBien: 1,
      nbEtudiants: 1,
      pourcentageExcellent: {
        $round: [
          { $multiply: [{ $divide: ["$nbExcellent", "$nbEtudiants"] }, 100] },
          1
        ]
      }
    }
  },
  {
    $sort: { moyenne: -1 }  // Changez ceci selon votre critère
  }
])
  return results as TopSupervisorResult[];
}
