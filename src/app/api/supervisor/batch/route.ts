// app/api/student/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Supervisor from '@/models/Supervisor';
import mongoose from 'mongoose';

const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const { supervisors } = await request.json();
   

    if (!supervisors || !Array.isArray(supervisors) || supervisors.length === 0) {
      return NextResponse.json(
        { error: 'No supervisors provided' },
        { status: 400 }
      );
    }
    
    await connectDB();

    let totalInserted = 0;
    let totalFailed = 0;
    const errors: any[] = [];
    const insertedIds: any[] = [];

    for (let i = 0; i < supervisors.length; i += BATCH_SIZE) {
      const batch = supervisors.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

     

      try {
        const result = await Supervisor.insertMany(batch, { 
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

    return NextResponse.json({
      success: true,
      data: {
        inserted: totalInserted,
        failed: totalFailed,
        total: supervisors.length,
        insertedIds: insertedIds.slice(0, 5),
        databaseName: mongoose.connection.name,
        collectionName: Supervisor.collection.name,
        errors: errors.length > 0 ? errors : undefined,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to insert supervisors',
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
    
    // Try multiple ways to count
    const count1 = await Supervisor.countDocuments();

    const students = await Supervisor.find().limit(10);
    const directDocs = await mongoose.connection.db?.collection('supervisors').find().limit(10).toArray();
    
    
    // List all collections
    const collections = await mongoose.connection.db?.listCollections().toArray();
 
    
    return NextResponse.json({ 
      success: true,
      counts: {
        mongooseCount: count1
      },
      documents: {
        mongoose: students.length,
        direct: directDocs?.length,
      },
      students,
      directDocs,
      collections: collections?.map(c => c.name),
      databaseName: mongoose.connection.name,
      collectionName: Supervisor.collection.name,
    });
  } catch (error: any) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisors', message: error.message },
      { status: 500 }
    );
  }
}