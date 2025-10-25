
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Company from '@/models/Company';


const BATCH_SIZE = 500;

export async function POST(request: NextRequest) {
  try {
    const { companies } = await request.json();

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json(
        { error: 'No companies provided' },
        { status: 400 }
      );
    }

    await connectDB();

    let totalInserted = 0;
    let totalFailed = 0;

    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = companies.slice(i, i + BATCH_SIZE);

      try {
        const result = await Company.insertMany(batch, { 
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
        total: companies.length,
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