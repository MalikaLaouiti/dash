// app/api/student/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import mongoose from 'mongoose';
import { StudentDTO } from '@/dto/student.dto';

const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const { students } = await request.json();

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'No students provided' },
        { status: 400 }
      );
    }

    await connectDB();

    let totalInserted = 0;
    let totalFailed = 0;
    const errors: any[] = [];
    const insertedIds: any[] = [];

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

      try {
        const result = await Student.insertMany(batch, { 
          ordered: false,
        });
        
        if (Array.isArray(result)) {
          totalInserted += result.length;
          insertedIds.push(...result.map((doc: any) => doc._id));
        }

      } catch (error: any) {
        
        
        if (error.writeErrors) {
          const inserted = batch.length - error.writeErrors.length;
          totalInserted += inserted;
          totalFailed += error.writeErrors.length;

         
          error.writeErrors.forEach((err: any, idx: number) => {
            console.error(`   Write Error ${idx + 1}:`, {
              index: err.index,
              code: err.err.code,
              message: err.err.errmsg,
            });
            errors.push({
              batch: batchNumber,
              index: err.index,
              code: err.err.code,
              message: err.err.errmsg,
            });
          });

          // Get IDs of successfully inserted docs
          if (error.insertedDocs && Array.isArray(error.insertedDocs)) {
            insertedIds.push(...error.insertedDocs.map((doc: any) => doc._id));
          }
        } else {
          totalFailed += batch.length;
          errors.push({
            batch: batchNumber,
            error: error.message,
            stack: error.stack,
          });
        }
      }
    }
    
    const finalCount = await Student.countDocuments();
    const estimatedCount = await Student.estimatedDocumentCount();
    return NextResponse.json({
      success: true,
      data: {
        inserted: totalInserted,
        failed: totalFailed,
        total: students.length,
        verification: {
          countDocuments: finalCount,
          estimatedDocumentCount: estimatedCount,
        },
        insertedIds: insertedIds.slice(0, 5),
        databaseName: mongoose.connection.name,
        collectionName: Student.collection.name,
        errors: errors.length > 0 ? errors : undefined,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to insert students',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const students: StudentDTO[] = await Student.find();

    return NextResponse.json({ 
      success: true,
      data: students,  
      count: students.length
    });
  } catch (error: any) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students', message: error.message },
      { status: 500 }
    );
  }
}