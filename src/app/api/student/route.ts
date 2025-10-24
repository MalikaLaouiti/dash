"use server";
import { NextRequest, NextResponse } from 'next/server';
import Student from '@/models/Student';
import { connectDB } from '@/lib/mongodb';


// GET - Get all students
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const students = await Student.find()
      .populate('company')
      .populate('academicSupervisor')
      .populate('professionalSupervisor')
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Student.countDocuments();
    
    return NextResponse.json({
      students,
      pagination: { page, limit, total }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create new student
export async function createStudent(studentData: any) {
  try {
    await connectDB();
    const student = await Student.create(studentData);
    return student;
  } catch (error) {
    console.error('Failed to create student:', error);
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