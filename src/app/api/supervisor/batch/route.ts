// app/api/student/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Supervisor from '@/models/Supervisor';
import mongoose from 'mongoose';

const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const { supervisors } = await request.json();
   //console.log(`📥 Received ${supervisors?.length || 0} supervisors to insert`);

    if (!supervisors || !Array.isArray(supervisors) || supervisors.length === 0) {
      return NextResponse.json(
        { error: 'No supervisors provided' },
        { status: 400 }
      );
    }

    // ✅ LOG FIRST STUDENT DATA
   //console.log('📄 First supervisor data:', JSON.stringify(supervisors[0], null, 2));

    await connectDB();
    
   //console.log('✅ Database connected to:', mongoose.connection.name);
   //console.log('📝 Collection name:', Supervisor.collection.name);

    let totalInserted = 0;
    let totalFailed = 0;
    const errors: any[] = [];
    const insertedIds: any[] = [];

    for (let i = 0; i < supervisors.length; i += BATCH_SIZE) {
      const batch = supervisors.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

     //console.log(`🔄 Processing batch ${batchNumber} (${batch.length} records)`);

      try {
        // ✅ TRY INSERTING WITH FULL RESULT
        const result = await Supervisor.insertMany(batch, { 
          ordered: false,
        });
        
       //console.log(`✅ Batch ${batchNumber}: insertMany returned`);
       //console.log(`   Result type:`, typeof result);
       //console.log(`   Result is array:`, Array.isArray(result));
       //console.log(`   Result length:`, result?.length);
        
        if (Array.isArray(result)) {
          totalInserted += result.length;
          insertedIds.push(...result.map((doc: any) => doc._id));
         //console.log(`   Inserted ${result.length} documents`);
         //console.log(`   First inserted ID:`, result[0]?._id);
        }

        // ✅ COUNT IMMEDIATELY AFTER INSERT
        const countAfter = await Supervisor.countDocuments();
       //console.log(`🔍 Count after batch ${batchNumber}: ${countAfter}`);

        // ✅ TRY TO FIND THE DOCUMENTS WE JUST INSERTED
        if (insertedIds.length > 0) {
          const found = await Supervisor.findById(insertedIds[0]);
         //console.log(`🔍 Can we find first inserted doc?`, found ? 'YES' : 'NO');
          if (found) {
           //console.log(`   Found doc:`, { _id: found._id, prenom: found.prenom });
          }
        }

      } catch (error: any) {
        console.error(`❌ Batch ${batchNumber} error:`, error.message);
        console.error(`   Error name:`, error.name);
        console.error(`   Error code:`, error.code);
        
        if (error.writeErrors) {
          const inserted = batch.length - error.writeErrors.length;
          totalInserted += inserted;
          totalFailed += error.writeErrors.length;

         //console.log(`⚠️ Partial success: ${inserted} inserted, ${error.writeErrors.length} failed`);

          // Log ALL errors, not just first 3
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

    // ✅ FINAL VERIFICATION
   //console.log('🔍 Starting final verification...');
    
    const finalCount = await Supervisor.countDocuments();
   //console.log(`📊 countDocuments(): ${finalCount}`);

    const estimatedCount = await Supervisor.estimatedDocumentCount();
   //console.log(`📊 estimatedDocumentCount(): ${estimatedCount}`);

    const findAll = await Supervisor.find();
   //console.log(`📊 find().length: ${findAll.length}`);

    // ✅ CHECK COLLECTION DIRECTLY
    const directCount = await mongoose.connection.db?.collection('supervisors').countDocuments();
   //console.log(`📊 Direct collection count: ${directCount}`);

    const directFind = await mongoose.connection.db?.collection('supervisors').find().limit(3).toArray();
   //console.log(`📊 Direct collection find:`, directFind?.length, 'documents');
    if (directFind && directFind.length > 0) {
     //console.log(`   First doc from direct query:`, directFind[0]);
    }

    // ✅ LIST ALL COLLECTIONS
    const collections = await mongoose.connection.db?.listCollections().toArray();
   //console.log(`📊 All collections in database:`, collections?.map(c => c.name));

    return NextResponse.json({
      success: true,
      data: {
        inserted: totalInserted,
        failed: totalFailed,
        total: supervisors.length,
        verification: {
          countDocuments: finalCount,
          estimatedDocumentCount: estimatedCount,
          findLength: findAll.length,
          directCount: directCount,
          directFindLength: directFind?.length,
        },
        insertedIds: insertedIds.slice(0, 5),
        databaseName: mongoose.connection.name,
        collectionName: Supervisor.collection.name,
        allCollections: collections?.map(c => c.name),
        errors: errors.length > 0 ? errors : undefined,
      },
    });

  } catch (error: any) {
    console.error('❌ Batch insert failed:', error);
    console.error('   Stack:', error.stack);
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
    
   //console.log('✅ GET - Database:', mongoose.connection.name);
   //console.log('📝 GET - Collection:', Supervisor.collection.name);
    
    // Try multiple ways to count
    const count1 = await Supervisor.countDocuments();
    const count2 = await Supervisor.estimatedDocumentCount();
    const count3 = await mongoose.connection.db?.collection('supervisors').countDocuments();
    
   //console.log(`📊 Mongoose countDocuments: ${count1}`);
   //console.log(`📊 Mongoose estimatedDocumentCount: ${count2}`);
   //console.log(`📊 Direct collection count: ${count3}`);
    
    const students = await Supervisor.find().limit(10);
    const directDocs = await mongoose.connection.db?.collection('supervisors').find().limit(10).toArray();
    
   //console.log(`📄 Mongoose find: ${students.length} docs`);
   //console.log(`📄 Direct find: ${directDocs?.length} docs`);
    
    // List all collections
    const collections = await mongoose.connection.db?.listCollections().toArray();
   //console.log(`📊 All collections:`, collections?.map(c => c.name));
    
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
      collectionName: Supervisor.collection.name,
    });
  } catch (error: any) {
    console.error('❌ GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisors', message: error.message },
      { status: 500 }
    );
  }
}