// app/api/companies/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Supervisor from '@/models/Supervisor';
// import { serializeMongoDoc } from '@/lib/serializers';

const BATCH_SIZE = 500;

export async function POST(request: NextRequest) {
  try {
    const { supervisors } = await request.json();
    console.log(supervisors)

    if (!supervisors || !Array.isArray(supervisors) || supervisors.length === 0) {
      return NextResponse.json(
        { error: 'No supervisors provided' },
        { status: 400 }
      );
    }

    await connectDB();

    let totalInserted = 0;
    let totalFailed = 0;

    for (let i = 0; i < supervisors.length; i += BATCH_SIZE) {
      const batch = supervisors.slice(i, i + BATCH_SIZE);

      try {
        const result = await Supervisor.insertMany(batch, { 
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
        total: supervisors.length,
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