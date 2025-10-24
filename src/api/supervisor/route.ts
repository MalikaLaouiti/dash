"use server";

import { connectDB } from '@/lib/mongodb';
import Supervisor from '@/models/Supervisor';


// GET - Get all students

export async function getSupervisor(){
  try {
    await connectDB();
    const supervisor = await Supervisor.find()
      .populate('company')
    return supervisor;
  }
  catch (error) {
    console.error('Failed to fetch supervisors:', error);
    throw error;
  }
}

// POST - Create new supervisor
export async function createSupervisor(supervisorData: any) {
  try {
    await connectDB();
    const supervisor = await Supervisor.create(supervisorData);
    return supervisor;
  } catch (error) {
    console.error('Failed to create supervisor:', error);
    throw error;
  }
}

export async function createSupervisorsBatch(supervisorsData: any[]) {
  try {
    await connectDB();
    const supervisor = await Supervisor.insertMany(supervisorsData, { ordered: false });
    return supervisor;
  } catch (error) {
    console.error('Failed to create supervisors batch:', error);
    throw error;
  }
}
