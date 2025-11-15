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

function normalizeCompanyName(name:string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
export async function POST(request: NextRequest) {
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let totalDuplicates = 0;
  const insertedIds: string[] = [];
  const updatedCompanies: string[] = [];
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
          annee: Number(company.annee)
        }));

        const companyKeys = normalizedBatch.map(company => ({
          nomNormalise: company.nomNormalise, 
          annee: company.annee
        }));

        const existingCompanies = await Company.find(
          {
            $or: companyKeys.map(ck => ({
              nomNormalise: ck.nomNormalise, 
              annee: ck.annee
            }))
          },
          { nom: 1, nomNormalise: 1, _id: 1, annee: 1, nombreStagiaires: 1 }
        ).lean();

        logger.info('EXISTING_FOUND', `Batch ${batchNumber}`, {
          found: existingCompanies.length,
          searching: companyKeys.length
        });

        const existingNomsMap = new Map(
          existingCompanies.map(ec => [
            `${ec.nomNormalise}-${ec.annee}`,  
            { 
              id: ec._id, 
              currentCount: ec.nombreStagiaires || 0,
              nom: ec.nom,
              annee: ec.annee
            }
          ])
        );

        const bulkOperations = normalizedBatch.map(company => {
          const companyKey = `${company.nomNormalise}-${company.annee}`;  
          const existingCompany = existingNomsMap.get(companyKey);
          const isDuplicate = !!existingCompany;

          if (isDuplicate) {
            totalDuplicates++;
            updatedCompanies.push(companyKey);
            
            return {
              updateOne: {
                filter: { 
                  nomNormalise: company.nomNormalise,  
                  annee: company.annee
                },
                update: {
                  $inc: { nombreStagiaires: 1 },
                  $set: {
                    nom: company.nom,  
                    secteur: company.secteur,
                    adresse: company.adresse,
                    contact: company.contact,
                    email: company.email,
                    telephone: company.telephone,
                    updatedAt: new Date(),
                    lastActivity: new Date()
                  }
                }
              }
            };
          } else {
            return {
              updateOne: {
                filter: { 
                  nomNormalise: company.nomNormalise,  
                  annee: company.annee
                },
                update: {
                  $setOnInsert: {
                    nom: company.nom,
                    nomNormalise: company.nomNormalise,
                    secteur: company.secteur,
                    adresse: company.adresse,
                    contact: company.contact,
                    email: company.email,
                    telephone: company.telephone,
                    annee: company.annee,
                    createdAt: new Date(),
                    nombreStagiaires: 1
                  },
                  $set: {
                    updatedAt: new Date(),
                    lastActivity: new Date()
                  }
                },
                upsert: true
              }
            };
          }
        });

        const result = await Company.bulkWrite(bulkOperations, { ordered: false });
        totalInserted += result.upsertedCount || 0;
        totalUpdated += result.modifiedCount || 0;

        if (result.upsertedIds) {
          const newIds = Object.values(result.upsertedIds)
            .map((doc: any) => doc._id?.toString())
            .filter(id => id);
          insertedIds.push(...newIds);
        }

        logger.info('BATCH_SUCCESS', `Batch ${batchNumber}`, {
          batch: batchNumber,
          inserted: result.upsertedCount,
          updated: result.modifiedCount,
          duplicates: totalDuplicates,
          matchedCount: result.matchedCount
        });

        if (result.modifiedCount > 0 && normalizedBatch[0]) {
          const sampleUpdated = await Company.findOne({
            nomNormalise: normalizedBatch[0].nomNormalise,
            annee: normalizedBatch[0].annee
          }).select('nom nombreStagiaires');
          
          if (sampleUpdated) {
            logger.info('INCREMENT_VERIFICATION', 'Check', {
              company: sampleUpdated.nom,
              count: sampleUpdated.nombreStagiaires
            });
          }
        }

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
              code: writeError.err.code,
              message: writeError.err.message,
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

    const totalProcessed = totalInserted + totalUpdated;
    const efficiency = rawCompanies.length > 0 
      ? ((totalProcessed / rawCompanies.length) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        operation: 'upsert',
        inserted: totalInserted,
        updated: totalUpdated,
        duplicates: totalDuplicates,
        failed: totalFailed,
        total: rawCompanies.length,
        efficiency: `${efficiency}%`,
        insertedIds: insertedIds.slice(0, 10),
        updatedCompanies: updatedCompanies.slice(0, 10),
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        summary: {
          batchesProcessed: Math.ceil(rawCompanies.length / BATCH_SIZE),
          successRate: efficiency,
          newCompaniesRate: `${((totalInserted / rawCompanies.length) * 100).toFixed(1)}%`,
          updateRate: `${((totalUpdated / rawCompanies.length) * 100).toFixed(1)}%`,
          duplicateRate: `${((totalDuplicates / rawCompanies.length) * 100).toFixed(1)}%`
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