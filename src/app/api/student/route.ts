"use server";
import { NextRequest, NextResponse } from 'next/server';
import Student from '@/models/Student';
import { connectDB } from '@/lib/mongodb';
import { StudentDTO } from '@/dto/student.dto';
import { serializeMongoDoc } from '@/lib/serializers';


export async function getStudents(){
  try {
    await connectDB();
    const students = await Student.find()
      .populate('company')
      .populate('academicSupervisor')
      .populate('professionalSupervisor');
    return serializeMongoDoc(students);
  }
  catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
}

export async function createStudent(studentData: any) : Promise<StudentDTO>{
  try {
    await connectDB();
    const student = await Student.create(studentData);
    return serializeMongoDoc(student);
  } catch (error) {
    console.error('Failed to create student:', error);
    throw error;
  }
}

export async function createStudentsBatch(studentsData: any[]) {
  try {
    await connectDB();
    const students = await Student.insertMany(studentsData, { ordered: false });
    return serializeMongoDoc(students);
  } catch (error) {
    console.error('Failed to create students batch:', error);
    throw error;
  }
}

// PUT - Update multiple students (bulk update)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { ids, updateData } = body;
    
    const result = await Student.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update students' },
      { status: 500 }
    );
  }
}

// DELETE - Delete multiple students
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',');
    
    if (!ids) {
      return NextResponse.json(
        { error: 'Student IDs required' },
        { status: 400 }
      );
    }
    
    await Student.deleteMany({ _id: { $in: ids } });
    
    return NextResponse.json({ message: 'Students deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete students' },
      { status: 500 }
    );
  }
}

export async function getFiliereDistribution() {
  return await Student.aggregate([
    {
      $group: {
        _id: '$filiere',
        nombreEtudiants: { $sum: 1 },
        moyenneNotes: { $avg: '$note' },
        anneesActives: { $addToSet: '$annee' }
      }
    },
    {
      $project: {
        _id: 0,
        filiere: '$_id',
        nombreEtudiants: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        nombreAnneesActives: { $size: '$anneesActives' }
      }
    },
    { $sort: { nombreEtudiants: -1 } }
  ]);
}

export async function getYearlyStats() {
  return await Student.aggregate([
    {
      $group: {
        _id: '$annee',
        nombreEtudiants: { $sum: 1 },
        moyenneNotes: { $avg: '$note' },
        nombreFilieres: { $addToSet: '$filiere' },
        nombreEntreprises: { $addToSet: '$companyId' },
        nombreEncadrants: { $addToSet: '$supervisorId' }
      }
    },
    {
      $project: {
        _id: 0,
        annee: '$_id',
        nombreEtudiants: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        nombreFilieres: { $size: '$nombreFilieres' },
        nombreEntreprises: { $size: '$nombreEntreprises' },
        nombreEncadrants: { $size: '$nombreEncadrants' }
      }
    },
    { $sort: { annee: -1 } }
  ]);
}

export async function getGradesByFiliere(filiere?: string | null, year?: string | null) {
  const matchStage: any = {};
  if (filiere) matchStage.filiere = filiere;
  if (year) matchStage.annee = parseInt(year);
  
  return await Student.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          filiere: '$filiere',
          annee: '$annee'
        },
        nombreEtudiants: { $sum: 1 },
        moyenneNotes: { $avg: '$note' },
        noteMin: { $min: '$note' },
        noteMax: { $max: '$note' },
        ecartType: { $stdDevPop: '$note' },
        notes: { $push: '$note' }
      }
    },
    {
      $project: {
        _id: 0,
        filiere: '$_id.filiere',
        annee: '$_id.annee',
        nombreEtudiants: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        noteMin: { $round: ['$noteMin', 2] },
        noteMax: { $round: ['$noteMax', 2] },
        ecartType: { $round: ['$ecartType', 2] },
        mediane: {
          $let: {
            vars: {
              sortedNotes: {
                $sortArray: { input: '$notes', sortBy: 1 }
              }
            },
            in: {
              $arrayElemAt: [
                '$$sortedNotes',
                { $floor: { $divide: [{ $size: '$$sortedNotes' }, 2] } }
              ]
            }
          }
        }
      }
    },
    { $sort: { annee: -1, filiere: 1 } }
  ]);
}

export async function getPopularDomains() {
  return await Student.aggregate([
    {
      $lookup: {
        from: 'companies',
        localField: 'companyId',
        foreignField: '_id',
        as: 'company'
      }
    },
    { $unwind: '$company' },
    {
      $group: {
        _id: '$company.secteur',
        nombreEtudiants: { $sum: 1 },
        moyenneNotes: { $avg: '$note' },
        filieres: { $addToSet: '$filiere' },
        companies: { $addToSet: '$company.nom' }
      }
    },
    {
      $project: {
        _id: 0,
        secteur: '$_id',
        nombreEtudiants: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        nombreFilieres: { $size: '$filieres' },
        nombreEntreprises: { $size: '$companies' },
        popularityScore: {
          $multiply: ['$nombreEtudiants', '$moyenneNotes']
        }
      }
    },
    { $sort: { popularityScore: -1 } }
  ]);
}
