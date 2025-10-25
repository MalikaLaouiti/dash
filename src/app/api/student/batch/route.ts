
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';


const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES = 100;

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
    

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
  
      try {
        const result = await Student.insertMany(batch, { 
          ordered: false,
          rawResult: true,
        });
        totalInserted += result.insertedCount || batch.length;
      } catch (error: any) {
        if (error.writeErrors) {
          totalInserted += batch.length - error.writeErrors.length;
          totalFailed += error.writeErrors.length;
        } else {
          totalFailed += batch.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        inserted: totalInserted,
        failed: totalFailed,
        total: students.length,
      },
    });

  } catch (error) {
    console.error('Batch insert failed:', error);
    return NextResponse.json(
      { error: 'Failed to insert companies' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const students = await Student.find().limit(1000);
  return NextResponse.json({ students });
}