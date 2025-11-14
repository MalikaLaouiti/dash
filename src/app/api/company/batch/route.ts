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

export async function POST(request: NextRequest) {
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let totalDuplicates = 0;
  const insertedIds: string[] = [];
  const updatedEmails: string[] = [];
  const errors: any[] = [];

  try {
    const { companies: rawCompanies } = await request.json();

    if (!rawCompanies || !Array.isArray(rawCompanies) || rawCompanies.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Companies array is required and cannot be empty'
        },
        { status: 400 }
      );
    }

    await connectDB();

    const BATCH_SIZE = 100;

    for (let i = 0; i < rawCompanies.length; i += BATCH_SIZE) {
      const batch = rawCompanies.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

      try {
        // Créer des clés uniques combinant nom + année
        const companyKeys = batch.map(company => ({
          nom: company.nom.toLowerCase(),
          annee: company.annee
        }));

        // Chercher les entreprises existantes avec même nom ET même année
        const existingCompanies = await Company.find(
          {
            $or: companyKeys.map(ck => ({
              nom: ck.nom,
              annee: ck.annee
            }))
          },
          { nom: 1, _id: 1, annee: 1, nombreStagiaires: 1 }
        ).lean();

        // Map avec clé composite "nom-annee"
        const existingNomsMap = new Map(
          existingCompanies.map(ec => [
            `${ec.nom}-${ec.annee}`, 
            { 
              id: ec._id, 
              currentCount: ec.nombreStagiaires || 0 
            }
          ])
        );

        // SOLUTION CORRECTE: Séparer les opérations selon le cas
        const bulkOperations = batch.map(company => {
          const nom = company.nom.toLowerCase();
          const companyKey = `${nom}-${company.annee}`;
          const existingCompany = existingNomsMap.get(companyKey);
          const isDuplicate = !!existingCompany;

          if (isDuplicate) {
            totalDuplicates++;
            updatedEmails.push(companyKey);
            
            // CAS 1: Entreprise existe déjà → Incrémenter seulement
            return {
              updateOne: {
                filter: { 
                  nom,
                  annee: company.annee
                },
                update: {
                  $inc: { nombreStagiaires: 1 },
                  $set: {
                    updatedAt: new Date(),
                    lastActivity: new Date()
                  }
                }
              }
            };
          } else {
            // CAS 2: Nouvelle entreprise → Créer avec nombreStagiaires: 1
            return {
              updateOne: {
                filter: { 
                  nom,
                  annee: company.annee
                },
                update: {
                  $setOnInsert: {
                    nom: company.nom,
                    secteur: company.secteur,
                    adresse: company.adresse,
                    contact: company.contact,
                    email: company.email,
                    telephone: company.telephone,
                    annee: company.annee,
                    createdAt: new Date(),
                    nombreStagiaires: 1  // Premier stagiaire
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

        logger.info('BATCH_SUCCESS', `Batch ${batchNumber} traité`, {
          batch: batchNumber,
          nouvelles: result.upsertedCount,
          misesAJour: result.modifiedCount,
          doublons: totalDuplicates,
          matchedCount: result.matchedCount
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
              code: writeError.err.code,
              message: writeError.err.message,
              document: {
                nom: batch[writeError.index]?.nom,
                email: batch[writeError.index]?.email
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
        updatedEmails: updatedEmails.slice(0, 10),
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        summary: {
          batchesProcessed: Math.ceil(rawCompanies.length / BATCH_SIZE),
          successRate: efficiency,
          newCompaniesRate: `${((totalInserted / rawCompanies.length) * 100).toFixed(1)}%`,
          updateRate: `${((totalUpdated / rawCompanies.length) * 100).toFixed(1)}%`
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