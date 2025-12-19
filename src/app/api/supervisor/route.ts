"use server";

import { connectDB } from '@/lib/mongodb';
import Supervisor from '@/models/Supervisor';
import { serializeMongoDoc } from '@/lib/serializers';
import { SupervisorDTO } from '@/dto/supervisor.dto';
import Student from '@/models/Student';


export async function getSupervisor(): Promise<SupervisorDTO[]> {
  try {
    await connectDB();
    const supervisor = await Supervisor.find()
      .populate('company')
    return serializeMongoDoc(supervisor);
  }
  catch (error) {
    console.error('Failed to fetch supervisors:', error);
    throw error;
  }
}

// POST - Create new supervisor
export async function createSupervisor(supervisorData: any): Promise<SupervisorDTO> {
  try {
    await connectDB();
    const supervisor = await Supervisor.create(supervisorData);
    return serializeMongoDoc(supervisor)
  } catch (error) {
    console.error('Failed to create supervisor:', error);
    throw error;
  }
}

export async function createSupervisorsBatch(supervisorsData: any[]):Promise<SupervisorDTO[]> {
  try {
    await connectDB();
    const supervisor = await Supervisor.insertMany(supervisorsData, { ordered: false });
    return serializeMongoDoc(supervisor);
  } catch (error) {
    console.error('Failed to create supervisors batch:', error);
    throw error;
  }
}

export async function getSupervisorWorkload() {
  return await Student.aggregate([
    {
      $group: {
        _id: {
          supervisorId: '$supervisorId',
          annee: '$annee'
        },
        nombreEtudiants: { $sum: 1 },
        moyenneNotes: { $avg: '$note' },
        filieres: { $addToSet: '$filiere' }
      }
    },
    {
      $lookup: {
        from: 'supervisors',
        localField: '_id.supervisorId',
        foreignField: '_id',
        as: 'supervisor'
      }
    },
    { $unwind: '$supervisor' },
    {
      $project: {
        _id: 0,
        supervisorId: '$_id.supervisorId',
        annee: '$_id.annee',
        supervisorNom: '$supervisor.nom',
        supervisorPrenom: '$supervisor.prenom',
        nombreEtudiants: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        nombreFilieres: { $size: '$filieres' },
        chargeEstimee: {
          $multiply: ['$nombreEtudiants', 10]
        }
      }
    },
    { $sort: { annee: -1, nombreEtudiants: -1 } }
  ]);
}

export async function getTopSupervisorsByFiliere(filiere?: string | null) {
  const matchStage = filiere ? { filiere } : {};
  
  return await Student.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          supervisorId: '$supervisorId',
          filiere: '$filiere'
        },
        nombreEtudiants: { $sum: 1 },
        moyenneNotes: { $avg: '$note' },
        students: {
          $push: {
            nom: '$nom',
            prenom: '$prenom',
            note: '$note'
          }
        }
      }
    },
    {
      $lookup: {
        from: 'supervisors',
        localField: '_id.supervisorId',
        foreignField: '_id',
        as: 'supervisor'
      }
    },
    { $unwind: '$supervisor' },
    {
      $project: {
        _id: 0,
        supervisorId: '$_id.supervisorId',
        filiere: '$_id.filiere',
        supervisorNom: '$supervisor.nom',
        supervisorPrenom: '$supervisor.prenom',
        nombreEtudiants: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        students: 1
      }
    },
    { $sort: { nombreEtudiants: -1, moyenneNotes: -1 } },
    { $limit: 20 }
  ]);
}