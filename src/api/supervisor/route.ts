"use server";

import { connectDB } from '@/lib/mongodb';
import Supervisor from '@/models/Supervisor';
import { serializeMongoDoc } from '@/lib/serializers';
import { SupervisorDTO } from '@/dto/supervisoor.dto';


// GET - Get all students

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
