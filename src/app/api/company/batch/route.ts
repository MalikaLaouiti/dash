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
        // ====================================
        // ÉTAPE 1 : NORMALISATION
        // ====================================
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

        // ====================================
        // ÉTAPE 2 : INSERTION DIRECTE
        // ====================================
        const result = await Company.insertMany(normalizedBatch, { 
          ordered: false // Continue même en cas d'erreur sur un document
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

        // Gestion des erreurs partielles
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

    // ====================================
    // RÉSULTAT FINAL
    // ====================================
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
// export async function POST(request: NextRequest) {
//   let totalInserted = 0;
//   let totalUpdated = 0;
//   let totalFailed = 0;
//   let totalDuplicatesDB = 0;        // ✅ Doublons trouvés dans la DB
//   let totalDuplicatesInternal = 0;  // ✅ Doublons internes au batch
//   const insertedIds: string[] = [];
//   const updatedCompanies: string[] = [];
//   const errors: any[] = [];

//   try {
//     const { companies: rawCompanies } = await request.json();

//     if (!rawCompanies || !Array.isArray(rawCompanies) || rawCompanies.length === 0) {
//       return NextResponse.json(
//         { success: false, error: 'Companies array is required and cannot be empty' },
//         { status: 400 }
//       );
//     }

//     await connectDB();
//     const BATCH_SIZE = 100;

//     for (let i = 0; i < rawCompanies.length; i += BATCH_SIZE) {
//       const batch = rawCompanies.slice(i, i + BATCH_SIZE);
//       const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

//       try {
//         // ====================================
//         // ÉTAPE 1 : NORMALISATION
//         // ====================================
//         const normalizedBatch = batch.map(company => ({
//           ...company,
//           nomNormalise: normalizeCompanyName(company.nom),
//           annee: Number(company.annee)
//         }));

//         logger.info('BATCH_NORMALIZED', `Batch ${batchNumber}`, {
//           totalItems: normalizedBatch.length
//         });

//         // ====================================
//         // ÉTAPE 2 : DÉTECTION DOUBLONS INTERNES
//         // ====================================
//         const internalMap = new Map<string, {
//           firstIndex: number;
//           occurrences: number;
//           variants: string[];
//         }>();

//         normalizedBatch.forEach((company, index) => {
//           const key = `${company.nomNormalise}-${company.annee}`;
          
//           if (internalMap.has(key)) {
//             const entry = internalMap.get(key)!;
//             entry.occurrences++;
//             entry.variants.push(company.nom);
//           } else {
//             internalMap.set(key, {
//               firstIndex: index,
//               occurrences: 1,
//               variants: [company.nom]
//             });
//           }
//         });

//         const internalDuplicatesCount = normalizedBatch.length - internalMap.size;
//         totalDuplicatesInternal += internalDuplicatesCount;

//         logger.info('INTERNAL_DUPLICATES_DETECTED', `Batch ${batchNumber}`, {
//           originalSize: normalizedBatch.length,
//           uniqueCompanies: internalMap.size,
//           internalDuplicates: internalDuplicatesCount,
//           examples: Array.from(internalMap.entries())
//             .filter(([_, data]) => data.occurrences > 1)
//             .slice(0, 5)
//             .map(([key, data]) => ({
//               key,
//               occurrences: data.occurrences,
//               variants: data.variants
//             }))
//         });

//         // ====================================
//         // ÉTAPE 3 : RECHERCHE DANS LA DB (DOUBLONS EXTERNES)
//         // ====================================
//         const uniqueKeys = Array.from(internalMap.keys()).map(key => {
//           const [nomNormalise, anneeStr] = key.split('-');
//           const lastDashIndex = key.lastIndexOf('-');
//           return {
//             nomNormalise: key.substring(0, lastDashIndex),
//             annee: parseInt(key.substring(lastDashIndex + 1))
//           };
//         });

//         const existingCompanies = await Company.find(
//           {
//             $or: uniqueKeys.map(uk => ({
//               nomNormalise: uk.nomNormalise,
//               annee: uk.annee
//             }))
//           },
//           { nom: 1, nomNormalise: 1, _id: 1, annee: 1, nombreStagiaires: 1 }
//         ).lean();

//         logger.info('EXTERNAL_DUPLICATES_SEARCH', `Batch ${batchNumber}`, {
//           searchingFor: uniqueKeys.length,
//           foundInDB: existingCompanies.length
//         });

//         // ====================================
//         // ÉTAPE 4 : CRÉER MAP DES EXISTANTS (DB)
//         // ====================================
//         const existingMap = new Map(
//           existingCompanies.map(ec => [
//             `${ec.nomNormalise}-${ec.annee}`,
//             {
//               id: ec._id,
//               currentCount: ec.nombreStagiaires || 0,
//               nom: ec.nom,
//               annee: ec.annee
//             }
//           ])
//         );

//         // ====================================
//         // ÉTAPE 5 : CONSTRUIRE LES OPÉRATIONS BULK
//         // ====================================
//         const bulkOperations = [];
//         let dbDuplicatesInBatch = 0;

//         for (const [key, internalData] of internalMap.entries()) {
//           const company = normalizedBatch[internalData.firstIndex];
//           const existingCompany = existingMap.get(key);
//           const occurrencesInBatch = internalData.occurrences;

//           if (existingCompany) {
//             // ✅ CAS 1 : DOUBLON EXTERNE (existe dans la DB)
//             dbDuplicatesInBatch += occurrencesInBatch;
//             updatedCompanies.push(key);

//             logger.info('DUPLICATE_DB_FOUND', `Batch ${batchNumber}`, {
//               key,
//               nom: company.nom,
//               normalized: company.nomNormalise,
//               annee: company.annee,
//               currentCountInDB: existingCompany.currentCount,
//               occurrencesInBatch,
//               newTotal: existingCompany.currentCount + occurrencesInBatch,
//               variants: internalData.variants
//             });

//             bulkOperations.push({
//               updateOne: {
//                 filter: {
//                   nomNormalise: company.nomNormalise,
//                   annee: company.annee
//                 },
//                 update: {
//                   $inc: { 
//                     nombreStagiaires: occurrencesInBatch // ✅ Incrémenter par toutes les occurrences
//                   },
//                   $set: {
//                     nom: company.nom, // Garder le dernier nom vu
//                     secteur: company.secteur,
//                     adresse: company.adresse,
//                     contact: company.contact,
//                     email: company.email,
//                     telephone: company.telephone,
//                     updatedAt: new Date(),
//                     lastActivity: new Date()
//                   }
//                 }
//               }
//             });
//           } else {
//             // ✅ CAS 2 : NOUVELLE ENTREPRISE
//             logger.info('NEW_COMPANY', `Batch ${batchNumber}`, {
//               key,
//               nom: company.nom,
//               normalized: company.nomNormalise,
//               annee: company.annee,
//               occurrencesInBatch,
//               initialCount: occurrencesInBatch,
//               variants: internalData.variants
//             });

//             bulkOperations.push({
//               updateOne: {
//                 filter: {
//                   nomNormalise: company.nomNormalise,
//                   annee: company.annee
//                 },
//                 update: {
//                   $setOnInsert: {
//                     nom: company.nom,
//                     nomNormalise: company.nomNormalise,
//                     secteur: company.secteur,
//                     adresse: company.adresse,
//                     contact: company.contact,
//                     email: company.email,
//                     telephone: company.telephone,
//                     annee: company.annee,
//                     createdAt: new Date(),
//                     nombreStagiaires: occurrencesInBatch // ✅ Initialiser avec toutes les occurrences
//                   },
//                   $set: {
//                     updatedAt: new Date(),
//                     lastActivity: new Date()
//                   }
//                 },
//                 upsert: true
//               }
//             });
//           }
//         }

//         totalDuplicatesDB += dbDuplicatesInBatch;

//         logger.info('BULK_OPERATIONS_PREPARED', `Batch ${batchNumber}`, {
//           originalBatchSize: normalizedBatch.length,
//           uniqueOperations: bulkOperations.length,
//           internalDuplicates: internalDuplicatesCount,
//           dbDuplicates: dbDuplicatesInBatch,
//           newCompanies: bulkOperations.length - dbDuplicatesInBatch
//         });

//         // ====================================
//         // ÉTAPE 6 : EXÉCUTER LE BULKWRITE
//         // ====================================
//         if (bulkOperations.length === 0) {
//           logger.info('BATCH_SKIPPED', `Batch ${batchNumber} - No operations to execute`, {});
//           continue;
//         }

//         const result = await Company.bulkWrite(bulkOperations, { ordered: false });

//         totalInserted += result.upsertedCount || 0;
//         totalUpdated += result.modifiedCount || 0;

//         if (result.upsertedIds) {
//           const newIds = Object.values(result.upsertedIds)
//             .map((doc: any) => doc._id?.toString())
//             .filter(id => id);
//           insertedIds.push(...newIds);
//         }

//         logger.info('BATCH_SUCCESS', `Batch ${batchNumber}`, {
//           batch: batchNumber,
//           inserted: result.upsertedCount,
//           updated: result.modifiedCount,
//           matchedCount: result.matchedCount,
//           internalDuplicates: internalDuplicatesCount,
//           dbDuplicates: dbDuplicatesInBatch
//         });

//         // ====================================
//         // ÉTAPE 7 : VÉRIFICATION POST-INSERT
//         // ====================================
//         if (result.modifiedCount > 0 || result.upsertedCount > 0) {
//           const firstKey = Array.from(internalMap.keys())[0];
//           if (firstKey) {
//             const [nomNormalise, anneeStr] = [
//               firstKey.substring(0, firstKey.lastIndexOf('-')),
//               firstKey.substring(firstKey.lastIndexOf('-') + 1)
//             ];
            
//             const sampleUpdated = await Company.findOne({
//               nomNormalise,
//               annee: parseInt(anneeStr)
//             }).select('nom nomNormalise annee nombreStagiaires');

//             if (sampleUpdated) {
//               logger.info('INCREMENT_VERIFICATION', 'Vérification', {
//                 company: sampleUpdated.nom,
//                 normalized: sampleUpdated.nomNormalise,
//                 annee: sampleUpdated.annee,
//                 nombreStagiaires: sampleUpdated.nombreStagiaires
//               });
//             }
//           }
//         }

//       } catch (error: any) {
//         logger.error('BATCH_ERROR', error, { batch: batchNumber });

//         if (error.writeErrors) {
//           const successfulInBatch = batch.length - error.writeErrors.length;
//           totalInserted += successfulInBatch;
//           totalFailed += error.writeErrors.length;

//           error.writeErrors.forEach((writeError: any) => {
//             errors.push({
//               batch: batchNumber,
//               index: writeError.index,
//               code: writeError.code,
//               message: writeError.errmsg,
//               document: {
//                 nom: batch[writeError.index]?.nom,
//                 annee: batch[writeError.index]?.annee
//               }
//             });
//           });
//         } else {
//           totalFailed += batch.length;
//           errors.push({
//             batch: batchNumber,
//             error: 'Batch processing failed',
//             message: error.message
//           });
//         }
//       }
//     }

//     // ====================================
//     // CALCULS FINAUX
//     // ====================================
//     const totalProcessed = totalInserted + totalUpdated;
//     const totalDuplicates = totalDuplicatesDB + totalDuplicatesInternal;
//     const efficiency = rawCompanies.length > 0
//       ? ((totalProcessed / rawCompanies.length) * 100).toFixed(1)
//       : '0.0';

//     return NextResponse.json({
//       success: true,
//       data: {
//         operation: 'upsert',
//         inserted: totalInserted,                    // Nouvelles entreprises créées
//         updated: totalUpdated,                      // Entreprises existantes mises à jour
//         duplicatesTotal: totalDuplicates,           // Total doublons (internes + DB)
//         duplicatesInternal: totalDuplicatesInternal, // Doublons dans le même batch
//         duplicatesDB: totalDuplicatesDB,            // Doublons trouvés dans la DB
//         failed: totalFailed,
//         total: rawCompanies.length,
//         efficiency: `${efficiency}%`,
//         insertedIds: insertedIds.slice(0, 10),
//         updatedCompanies: updatedCompanies.slice(0, 10),
//         errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
//         summary: {
//           batchesProcessed: Math.ceil(rawCompanies.length / BATCH_SIZE),
//           successRate: efficiency,
//           newCompaniesRate: `${((totalInserted / rawCompanies.length) * 100).toFixed(1)}%`,
//           updateRate: `${((totalUpdated / rawCompanies.length) * 100).toFixed(1)}%`,
//           duplicateTotalRate: `${((totalDuplicates / rawCompanies.length) * 100).toFixed(1)}%`,
//           duplicateInternalRate: `${((totalDuplicatesInternal / rawCompanies.length) * 100).toFixed(1)}%`,
//           duplicateDBRate: `${((totalDuplicatesDB / rawCompanies.length) * 100).toFixed(1)}%`
//         },
//         breakdown: {
//           description: 'Distribution des données importées',
//           newCompanies: totalInserted,
//           existingCompaniesUpdated: totalUpdated,
//           duplicatesWithinFile: totalDuplicatesInternal,
//           duplicatesInDatabase: totalDuplicatesDB
//         }
//       }
//     }, {
//       status: totalFailed === 0 ? 200 : 207
//     });

//   } catch (error: any) {
//     logger.error('GLOBAL_BATCH_ERROR', error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Batch processing failed',
//         details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       },
//       { status: 500 }
//     );
//   }
// }

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