import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Supervisor from "@/models/Supervisor";
import mongoose from "mongoose";
import { SupervisorDTO } from "@/dto/supervisor.dto";

const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const { supervisors: rawSupervisors } = await request.json();

    if (
      !rawSupervisors ||
      !Array.isArray(rawSupervisors) ||
      rawSupervisors.length === 0
    ) {
      return NextResponse.json(
        { error: "No supervisors provided" },
        { status: 400 },
      );
    }

    await connectDB();

    let totalInserted = 0;
    let totalFailed = 0;
    let totalUpdated = 0;
    const errors: any[] = [];
    const insertedIds: any[] = [];

    const supervisorsByYear = rawSupervisors.reduce(
      (acc, supervisor) => {
        const year = supervisor.annee.toString();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(supervisor);
        return acc;
      },
      {} as Record<string, SupervisorDTO[]>,
    );
    for (const [year, supervisors] of Object.entries(supervisorsByYear) as [string,SupervisorDTO[]][]) 
    {
      try {
        // S'assurer que le document année existe
        await Supervisor.findOneAndUpdate(
          { year },
          { $setOnInsert: { year, supervisors: [] } },
          { upsert: true, new: true },
        );

        const yearDoc = await Supervisor.findOne({ year });
        const existingCINs = new Set(
          yearDoc?.supervisors?.map((s: any) => s.cin) || [],
        );
        for (let i = 0; i < supervisors.length; i += BATCH_SIZE) {
          const batch = supervisors.slice(i, i + BATCH_SIZE);
          const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
          try {
            const supervisorsToInsert: any[] = [];
            const bulkUpdateOps: any[] = [];

            for (const supervisor of batch) {
              if (existingCINs.has(supervisor.prenom)) {
                // encadrant existe - préparer mise à jour
                const { prenom, ...updateFields } = supervisor;
                const setFields: any = { "supervisors.$.updatedAt": new Date() };

                Object.keys(updateFields).forEach((key) => {
                  const value = (updateFields as Record<string, any>)[key];
                  if (value !== undefined && value !== null) {
                    setFields[`supervisors.$.${key}`] = value;
                  }
                });

                bulkUpdateOps.push({
                  updateOne: {
                    filter: { year, "supervisors.prenom": prenom },
                    update: { $set: setFields },
                  },
                });
              } else {
                // Nouvel encadrant - préparer insertion
                supervisorsToInsert.push({
                  ...supervisor,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
                existingCINs.add(supervisor.prenom); // Éviter doublons dans même batch
              }
            }

            //Insérer tous les nouveaux encadrants EN UNE SEULE OPÉRATION
            if (supervisorsToInsert.length > 0) {
              await Supervisor.findOneAndUpdate(
                { year },
                { $push: { supervisors: { $each: supervisorsToInsert } } },
              );
              totalInserted += supervisorsToInsert.length;
            }

            //Mettre à jour tous les encadrants existants EN UNE SEULE OPÉRATION
            if (bulkUpdateOps.length > 0) {
              const result = await Supervisor.bulkWrite(bulkUpdateOps, {
                ordered: false,
              });
              totalUpdated += result.modifiedCount;
            }
          } catch (error: any) {
            totalFailed += batch.length;
            errors.push({
              year,
              batch: batchNumber,
              error: "Batch processing failed",
              message: error.message,
              count: batch.length,
            });
          }
        }
    } catch (error: any) {
        totalFailed += supervisors.length;
        errors.push({
          year,
          error: "Failed to process year",
          message: error.message,
          count: supervisors.length,
        });
      }
    }
    const finalCount = await Supervisor.countDocuments();
    return NextResponse.json({
      success: true,
      data: {
        operation: "upsert",
        inserted: totalInserted,
        updated: totalUpdated,
        failed: totalFailed,
        total: rawSupervisors.length,
        yearsProcessed: Object.keys(rawSupervisors).length,
        verification: {
          countDocuments: finalCount,
        },
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to insert supervisors",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const supervisors: SupervisorDTO[] = await Supervisor.find();

    return NextResponse.json({
      data: supervisors,
      count: supervisors.length,
    });
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supervisors", message: error.message },
      { status: 500 },
    );
  }
}
