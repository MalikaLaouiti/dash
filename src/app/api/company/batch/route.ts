import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import mongoose from "mongoose";
import { CompanyDTO } from "@/dto/company.dto";

function normalizeCompanyName(name: string): string {
  if (!name || typeof name !== "string") return "";
  const cleaned = name.trim();
  if (cleaned.length === 0) return "";
  return cleaned
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, "")
    .replace("societe", "")
    .trim();
}

export async function POST(request: NextRequest) {
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  const errors: any[] = [];

  try {
    const { companies: rawCompanies } = await request.json();

    if (!rawCompanies || !Array.isArray(rawCompanies) || rawCompanies.length === 0) {
      return NextResponse.json(
        { success: false, error: "Companies array is required and cannot be empty" },
        { status: 400 }
      );
    }

    await connectDB();

    // Grouper par année
    const companiesByYear = rawCompanies.reduce(
      (acc, company) => {
        const year = company.annee.toString();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(company);
        return acc;
      },
      {} as Record<string, CompanyDTO[]>
    );

    const BATCH_SIZE = 100;

    for (const [year, companies] of Object.entries(companiesByYear) as [string, CompanyDTO[]][]) {
      try {
        // S'assurer que le document année existe
        await Company.findOneAndUpdate(
          { year },
          { $setOnInsert: { year, companies: [] } },
          { upsert: true, new: true }
        );

        // Récupérer les sociétés existantes
        const yearDoc = await Company.findOne({ year });
        const existingCompanies = new Map(
          yearDoc?.companies?.map((c: any) => [c.nomNormalise, c]) || []
        );

        // Traiter par batch
        for (let i = 0; i < companies.length; i += BATCH_SIZE) {
          const batch = companies.slice(i, i + BATCH_SIZE);
          const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

          try {
            const companiesToInsert: any[] = [];
            const companiesToUpdate: any[] = [];

            for (const company of batch) {
              const nomNormalise = normalizeCompanyName(company.nom);

              if (existingCompanies.has(nomNormalise)) {
                const existingCompany = existingCompanies.get(nomNormalise);
                
                companiesToUpdate.push({
                  nomNormalise,
                  increment: company.nombreStagiaires, 
                  newEmails: company.email || [],
                  newTelephones: company.telephone || [],
                  newEncadrants: company.encadrantPro || []
                });
              } else {
                companiesToInsert.push({
                  nom: company.nom,
                  nomNormalise,
                  secteur: company.secteur,
                  annee: year,
                  adresse: company.adresse,
                  email: company.email || [],
                  telephone: company.telephone || [],
                  nombreStagiaires: company.nombreStagiaires, 
                  encadrantPro: company.encadrantPro || [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  lastActivity: new Date()
                });
                existingCompanies.set(nomNormalise, true);
              }
            }

            // Insérer les nouvelles sociétés
            if (companiesToInsert.length > 0) {
              await Company.findOneAndUpdate(
                { year },
                { $push: { companies: { $each: companiesToInsert } } }
              );
              totalInserted += companiesToInsert.length;
            }

            // Mettre à jour les sociétés existantes avec nouveau nbstgagiaires selon parser
            for (const update of companiesToUpdate) {
              const updateOperation: any = {
                $set: {
                  "companies.$.nombreStagiaires": update.increment,
                  "companies.$.lastActivity": new Date(),
                  "companies.$.updatedAt": new Date()
                }
              };

              // Ajouter les nouveaux emails/téléphones/encadrants sans doublons
              if (update.newEmails.length > 0) {
                updateOperation.$addToSet = updateOperation.$addToSet || {};
                updateOperation.$addToSet["companies.$.email"] = { $each: update.newEmails };
              }
              
              if (update.newTelephones.length > 0) {
                updateOperation.$addToSet = updateOperation.$addToSet || {};
                updateOperation.$addToSet["companies.$.telephone"] = { $each: update.newTelephones };
              }
              
              if (update.newEncadrants.length > 0) {
                updateOperation.$addToSet = updateOperation.$addToSet || {};
                updateOperation.$addToSet["companies.$.encadrantPro"] = { $each: update.newEncadrants };
              }

              await Company.findOneAndUpdate(
                {
                  year,
                  "companies.nomNormalise": update.nomNormalise
                },
                updateOperation
              );
              totalUpdated++;
            }

          } catch (error: any) {
            totalFailed += batch.length;
            errors.push({
              year,
              batch: batchNumber,
              error: "Batch processing failed",
              message: error.message,
              count: batch.length
            });
          }
        }
      } catch (error: any) {
        totalFailed += companies.length;
        errors.push({
          year,
          error: "Failed to process year",
          message: error.message,
          count: companies.length
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          operation: 'upsert',
          inserted: totalInserted,
          updated: totalUpdated,
          failed: totalFailed,
          total: rawCompanies.length,
          yearsProcessed: Object.keys(companiesByYear).length,
          errors: errors.length > 0 ? errors.slice(0, 10) : undefined
        }
      },
      { status: totalFailed === 0 ? 200 : 207 }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Batch processing failed",
        details: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const year = searchParams.get('year');
    const secteur = searchParams.get('secteur');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const pipeline: any[] = [];

    if (year) {
      pipeline.push({ $match: { year } });
    }

    pipeline.push({ $unwind: '$companies' });
    const matchConditions: any = {};

    if (secteur) {
      matchConditions['companies.secteur'] = secteur;
    }

    if (search) {
      matchConditions.$or = [
        { 'companies.nom': { $regex: search, $options: 'i' } },
        { 'companies.adresse': { $regex: search, $options: 'i' } }
      ];
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Compter le total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Company.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Pagination
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Projection
    pipeline.push({
      $project: {
        _id: '$companies._id',
        yearDocument: '$year',
        nom: '$companies.nom',
        nomNormalise: '$companies.nomNormalise',
        secteur: '$companies.secteur',
        annee: '$companies.annee',
        adresse: '$companies.adresse',
        email: '$companies.email',
        telephone: '$companies.telephone',
        nombreStagiaires: '$companies.nombreStagiaires',
        encadrantPro: '$companies.encadrantPro',
        lastActivity: '$companies.lastActivity',
        createdAt: '$companies.createdAt',
        updatedAt: '$companies.updatedAt'
      }
    });

    const companies = await Company.aggregate(pipeline);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        total,
        count: companies.length,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      },
      filters: {
        year: year || null,
        secteur: secteur || null,
        search: search || null,
      }
    });

  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch companies", 
        message: error.message 
      },
      { status: 500 }
    );
  }
}
