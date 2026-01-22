import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { StudentDTO } from "@/dto/student.dto";

const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const { students: rawStudents } = await request.json();

    if (!rawStudents || !Array.isArray(rawStudents) || rawStudents.length === 0) {
      return NextResponse.json(
        { error: "No students provided" },
        { status: 400 }
      );
    }

    await connectDB();

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalFailed = 0;
    const errors: any[] = [];

    // Grouper par année
    const studentsByYear = rawStudents.reduce((acc, student) => {
      const year = student.annee.toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(student);
      return acc;
    }, {} as Record<string, StudentDTO[]>);

    const BATCH_SIZE = 100;

    // Traiter chaque année
    for (const [year, students] of Object.entries(studentsByYear) as [string, StudentDTO[]][]) {
      try {
        // S'assurer que le document année existe
        await Student.findOneAndUpdate(
          { year },
          { $setOnInsert: { year, students: [] } },
          { upsert: true, new: true }
        );

        
        const yearDoc = await Student.findOne({ year });
        const existingCINs = new Set(
          yearDoc?.students?.map((s: any) => s.cin) || []
        );

        for (let i = 0; i < students.length; i += BATCH_SIZE) {
          const batch = students.slice(i, i + BATCH_SIZE);
          const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

          try {
            const studentsToInsert: any[] = [];
            const bulkUpdateOps: any[] = [];

            for (const student of batch) {
              if (existingCINs.has(student.cin)) {
                // Étudiant existe - préparer mise à jour
                const { cin, ...updateFields } = student;
                const setFields: any = { 'students.$.updatedAt': new Date() };

                Object.keys(updateFields).forEach(key => {
                  const value = (updateFields as Record<string, any>)[key];
                  if (value !== undefined && value !== null) {
                    setFields[`students.$.${key}`] = value;
                  }
                });

                bulkUpdateOps.push({
                  updateOne: {
                    filter: { year, 'students.cin': cin },
                    update: { $set: setFields }
                  }
                });
              } else {
                // Nouvel étudiant - préparer insertion
                studentsToInsert.push({
                  ...student,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
                existingCINs.add(student.cin); // Éviter doublons dans même batch
              }
            }

            //Insérer tous les nouveaux étudiants EN UNE SEULE OPÉRATION
            if (studentsToInsert.length > 0) {
              await Student.findOneAndUpdate(
                { year },
                { $push: { students: { $each: studentsToInsert } } }
              );
              totalInserted += studentsToInsert.length;
            }

            //Mettre à jour tous les étudiants existants EN UNE SEULE OPÉRATION
            if (bulkUpdateOps.length > 0) {
              const result = await Student.bulkWrite(bulkUpdateOps, { ordered: false });
              totalUpdated += result.modifiedCount;
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
        totalFailed += students.length;
        errors.push({
          year,
          error: "Failed to process year",
          message: error.message,
          count: students.length
        });
      }
    }

    const finalCount = await Student.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        operation: 'upsert',
        inserted: totalInserted,
        updated: totalUpdated,
        failed: totalFailed,
        total: rawStudents.length,
        yearsProcessed: Object.keys(studentsByYear).length,
        verification: {
          countDocuments: finalCount
        },
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process students",
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const students: StudentDTO[] = await Student.find();

    return NextResponse.json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students", message: error.message },
      { status: 500 },
    );
  }
}
