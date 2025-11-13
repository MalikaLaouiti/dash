import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Company from '@/models/Company';
import mongoose from 'mongoose';

const BATCH_SIZE = 100;

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
    const errors: any[] = [];
    const insertedIds: any[] = [];

    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = companies.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

     

      try {
       
        const result = await Company.insertMany(batch, { 
          ordered: false,
        });
        
        
        
        if (Array.isArray(result)) {
          totalInserted += result.length;
          insertedIds.push(...result.map((doc: any) => doc._id));
          
        }

      
        const countAfter = await Company.countDocuments();
       
       
        if (insertedIds.length > 0) {
          const found = await Company.findById(insertedIds[0]);
          
          if (found) {
          
          }
        }

      } catch (error: any) {
        console.error(`   Error code:`, error.code);
        
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

    
    
    const finalCount = await Company.countDocuments();
  
    const estimatedCount = await Company.estimatedDocumentCount();

    const findAll = await Company.find();

    const directCount = await mongoose.connection.db?.collection('companies').countDocuments();

    const directFind = await mongoose.connection.db?.collection('companies').find().limit(3).toArray();
    if (directFind && directFind.length > 0) {

    }

    // ✅ LIST ALL COLLECTIONS
    const collections = await mongoose.connection.db?.listCollections().toArray();
    //console.log(`📊 All collections in database:`, collections?.map(c => c.name));

    return NextResponse.json({
      success: true,
      data: {
        inserted: totalInserted,
        failed: totalFailed,
        total: companies.length,
        verification: {
          countDocuments: finalCount,
          estimatedDocumentCount: estimatedCount,
          findLength: findAll.length,
          directCount: directCount,
          directFindLength: directFind?.length,
        },
        insertedIds: insertedIds.slice(0, 5),
        databaseName: mongoose.connection.name,
        collectionName: Company.collection.name,
        allCollections: collections?.map(c => c.name),
        errors: errors.length > 0 ? errors : undefined,
      },
    });

  } catch (error: any) {
    console.error('   Stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to insert companies',
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
    
    const count1 = await Company.countDocuments();
    const count2 = await Company.estimatedDocumentCount();
    const count3 = await mongoose.connection.db?.collection('companies').countDocuments();
  
    
    const students = await Company.find().limit(10);
    const directDocs = await mongoose.connection.db?.collection('companies').find().limit(10).toArray();

    // List all collections
    const collections = await mongoose.connection.db?.listCollections().toArray();
    
    return NextResponse.json({ 
      success: true,
      counts: {
        mongooseCount: count1,
        estimatedCount: count2,
        directCount: count3,
      },
      documents: {
        mongoose: students.length,
        direct: directDocs?.length,
      },
      students,
      directDocs,
      collections: collections?.map(c => c.name),
      databaseName: mongoose.connection.name,
      collectionName: Company.collection.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch companies', message: error.message },
      { status: 500 }
    );
  }
}