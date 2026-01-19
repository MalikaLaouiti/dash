import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Company from '@/models/Company';
import mongoose from 'mongoose';
import { CompanyDTO } from '@/dto/company.dto';



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
  let totalUpdated = 0;
  let totalFailed = 0;
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

    const companiesByYear = rawCompanies.reduce((acc, company) => {
      const year = company.annee.toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(company);
      return acc;
    }, {} as Record<string, CompanyDTO[]>);

    const BATCH_SIZE = 100;

    for (const [year, companies] of Object.entries(companiesByYear) as [string, CompanyDTO[]][]) {
      try {
        // S'assurer que le document année existe
        await Company.findOneAndUpdate(
          { year },
          { $setOnInsert: { year, companies: [] } },
          { upsert: true, new: true }
        );

        // Récupérer toutes les sociétés existantes pour cette année
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
                // Société existe - préparer mise à jour
                companiesToUpdate.push({
                  nomNormalise,
                  increment: 1
                });
              } else {
                // Nouvelle société - préparer insertion
                companiesToInsert.push({
                  nom: company.nom,
                  nomNormalise,
                  secteur: company.secteur,
                  annee: year,
                  adresse: company.adresse,
                  email: company.email || [],
                  telephone: company.telephone || [],
                  nombreStagiaires: 1,
                  encadrantPro: company.encadrantPro || [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  lastActivity: new Date()
                });
                // Ajouter à la map pour éviter les doublons dans le même batch
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

            // Mettre à jour les sociétés existantes
            for (const { nomNormalise, increment } of companiesToUpdate) {
              await Company.findOneAndUpdate(
                {
                  year,
                  'companies.nomNormalise': nomNormalise
                },
                {
                  $inc: { 'companies.$.nombreStagiaires': increment },
                  $set: { 
                    'companies.$.lastActivity': new Date(),
                    'companies.$.updatedAt': new Date()
                  }
                }
              );
              totalUpdated++;
            }

          } catch (error: any) {
            totalFailed += batch.length;
            errors.push({
              year,
              batch: batchNumber,
              error: 'Batch processing failed',
              message: error.message,
              count: batch.length
            });
          }
        }

      } catch (error: any) {
        totalFailed += companies.length;
        errors.push({
          year,
          error: 'Failed to process year',
          message: error.message,
          count: companies.length
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        operation: 'upsert',
        inserted: totalInserted,
        updated: totalUpdated,
        failed: totalFailed,
        total: rawCompanies.length,
        yearsProcessed: Object.keys(companiesByYear).length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        summary: {
          yearBreakdown: Object.entries(companiesByYear).map(([year, companies]) => ({
            year,
            count: (companies as CompanyDTO[]).length
          }))
        }
      }
    }, {
      status: totalFailed === 0 ? 200 : 207
    });

  } catch (error: any) {
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const companies: CompanyDTO[] = await Company.find();

    return NextResponse.json({ 
      success: true,
      data: companies,  
      count: companies.length
    });
  } catch (error: any) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies', message: error.message },
      { status: 500 }
    );
  }
}