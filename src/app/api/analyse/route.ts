import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Company from '@/models/Company';
import Supervisor from '@/models/Supervisor';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Récupérer toutes les données
    const students = await Student.find({});
    const companies = await Company.find({});
    const supervisors = await Supervisor.find({});

    // 1. Statistiques par année
    const yearlyStats = await Student.aggregate([
      {
        $group: {
          _id: '$annee',
          students: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: 'annee',
          as: 'companies'
        }
      },
      {
        $lookup: {
          from: 'supervisors',
          localField: '_id',
          foreignField: 'annee',
          as: 'supervisors'
        }
      },
      {
        $project: {
          year: '$_id',
          students: 1,
          companies: { $size: '$companies' },
          supervisors: { $size: '$supervisors' },
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      { $sort: { year: -1 } }
    ]);

    // 2. Entreprises par année
    const companiesByYear = await Company.aggregate([
      {
        $group: {
          _id: '$annee',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: '$_id',
          count: 1
        }
      },
      { $sort: { year: -1 } }
    ]);

    // 3. Top encadreurs (par nombre d'étudiants et moyenne)
    const topSupervisors = await Student.aggregate([
      {
        $match: { score: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$encadreurAcId',
          students: { $sum: 1 },
          averageScore: { $avg: '$score' },
          scores: { $push: '$score' }
        }
      },
      {
        $match: { _id: { $ne: null, $ne: '' } }
      },
      {
        $project: {
          name: '$_id',
          students: 1,
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      { $sort: { students: -1, averageScore: -1 } },
      { $limit: 20 }
    ]);

    // 4. Top étudiants (meilleurs scores)
    const topStudents = await Student.aggregate([
      {
        $match: { score: { $exists: true, $ne: null } }
      },
      {
        $project: {
          name: '$prenom',
          score: 1,
          year: '$annee',
          project: '$titreProjet'
        }
      },
      { $sort: { score: -1 } },
      { $limit: 20 }
    ]);

    // 5. Distribution des notes
    const scoreDistribution = await Student.aggregate([
      {
        $match: { score: { $exists: true, $ne: null } }
      },
      {
        $bucket: {
          groupBy: '$score',
          boundaries: [0, 10, 12, 14, 16, 18, 20],
          default: 'Autres',
          output: {
            count: { $sum: 1 }
          }
        }
      },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '0-10' },
                { case: { $eq: ['$_id', 10] }, then: '10-12' },
                { case: { $eq: ['$_id', 12] }, then: '12-14' },
                { case: { $eq: ['$_id', 14] }, then: '14-16' },
                { case: { $eq: ['$_id', 16] }, then: '16-18' },
                { case: { $eq: ['$_id', 18] }, then: '18-20' }
              ],
              default: 'Autres'
            }
          },
          count: 1
        }
      }
    ]);

    // 6. Statistiques de collaboration
    const collaborationStats = await Student.aggregate([
      {
        $group: {
          _id: '$collaboration',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'binome'] }, then: 'Binôme' },
                { case: { $eq: ['$_id', 'monome'] }, then: 'Monôme' }
              ],
              default: 'Autres'
            }
          },
          count: 1
        }
      }
    ]);

    // Calculer les pourcentages pour les collaborations
    const totalStudents = students.length;
    const collaborationStatsWithPercentage = collaborationStats.map(stat => ({
      ...stat,
      percentage: totalStudents > 0 ? Math.round((stat.count / totalStudents) * 100) : 0
    }));

    return NextResponse.json({
      companiesByYear,
      topSupervisors,
      topStudents,
      scoreDistribution,
      collaborationStats: collaborationStatsWithPercentage,
      yearlyStats
    });

  } catch (error) {
    console.error('Erreur lors de l\'analyse des données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse des données' },
      { status: 500 }
    );
  }
}
