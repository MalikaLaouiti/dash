import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Company from '@/models/Company';
import mongoose from 'mongoose';

const logger = {
  error: (context: string, error: any, metadata?: any) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context,
      error: {
        message: error.message,
        code: error.code,
        name: error.name
      },
      metadata,
      environment: process.env.NODE_ENV
    }));
  },
  info: (context: string, message: string, metadata?: any) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      context,
      message,
      metadata,
      environment: process.env.NODE_ENV
    }));
  }
};

function normalizeCompanyName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  const cleaned = name.trim();
  if (cleaned.length === 0) return '';
  return cleaned
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, '')
    .replace("societe", "")
    .trim();
}

export async function POST(request: NextRequest) {
  let totalInserted = 0;
  let totalFailed = 0;
  const insertedIds: string[] = [];
  const errors: any[] = [];

  try {
    const { companies: rawCompanies } = await request.json();

    if (!rawCompanies || !Array.isArray(rawCompanies) || rawCompanies.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Companies array is required and cannot be empty' },
        { status: 400 }
      );
    }

    await connectDB();
    const BATCH_SIZE = 100;

    for (let i = 0; i < rawCompanies.length; i += BATCH_SIZE) {
      const batch = rawCompanies.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

      try {
        
        const normalizedBatch = batch.map(company => ({
          ...company,
          nomNormalise: normalizeCompanyName(company.nom),
          annee: Number(company.annee),
          nombreStagiaires: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActivity: new Date()
        }));

        logger.info('BATCH_NORMALIZED', `Batch ${batchNumber}`, {
          totalItems: normalizedBatch.length
        });

        const result = await Company.insertMany(normalizedBatch, { 
          ordered: false 
        });

        totalInserted += result.length;
        
        const newIds = result.map(doc => doc._id.toString());
        insertedIds.push(...newIds);

        logger.info('BATCH_SUCCESS', `Batch ${batchNumber}`, {
          batch: batchNumber,
          inserted: result.length
        });

      } catch (error: any) {
        logger.error('BATCH_ERROR', error, { batch: batchNumber });

        
        if (error.writeErrors) {
          const successfulInBatch = batch.length - error.writeErrors.length;
          totalInserted += successfulInBatch;
          totalFailed += error.writeErrors.length;

          error.writeErrors.forEach((writeError: any) => {
            errors.push({
              batch: batchNumber,
              index: writeError.index,
              code: writeError.code,
              message: writeError.errmsg,
              document: {
                nom: batch[writeError.index]?.nom,
                annee: batch[writeError.index]?.annee
              }
            });
          });
        } else {
          totalFailed += batch.length;
          errors.push({
            batch: batchNumber,
            error: 'Batch processing failed',
            message: error.message
          });
        }
      }
    }
    const efficiency = rawCompanies.length > 0
      ? ((totalInserted / rawCompanies.length) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        operation: 'insert',
        inserted: totalInserted,
        failed: totalFailed,
        total: rawCompanies.length,
        efficiency: `${efficiency}%`,
        insertedIds: insertedIds.slice(0, 10),
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        summary: {
          batchesProcessed: Math.ceil(rawCompanies.length / BATCH_SIZE),
          successRate: efficiency
        }
      }
    }, {
      status: totalFailed === 0 ? 200 : 207
    });

  } catch (error: any) {
    logger.error('GLOBAL_BATCH_ERROR', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Batch processing failed',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const [totalCount, sampleCompanies] = await Promise.all([
      Company.countDocuments(),
      Company.find()
        .select('nom email annee nombreStagiaires createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        sample: sampleCompanies,
        collection: Company.collection.collectionName,
        database: mongoose.connection.name
      }
    });

  } catch (error: any) {
    logger.error('BATCH_STATS_ERROR', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve company statistics'
      },
      { status: 500 }
    );
  }
}