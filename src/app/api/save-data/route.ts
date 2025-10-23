import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Company from '@/models/Company';
import Supervisor from '@/models/Supervisor';
import { ExcelParser, type ParsedExcelData } from '@/lib/excel-parser';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { rawExcelData } = await request.json();

    if (!rawExcelData) {
      return NextResponse.json(
        { error: 'Aucune donnée Excel fournie' },
        { status: 400 }
      );
    }

    // Parser les données Excel
    const parsedData: ParsedExcelData = ExcelParser.parseExcelData(rawExcelData);

    // Sauvegarder les étudiants
    const savedStudents = await Student.insertMany(parsedData.students);

    // Sauvegarder les entreprises
    const savedCompanies = await Company.insertMany(parsedData.companies);

    // Sauvegarder les encadreurs
    const savedSupervisors = await Supervisor.insertMany(parsedData.supervisors);

    return NextResponse.json({
      success: true,
      message: 'Données sauvegardées avec succès',
      counts: {
        students: savedStudents.length,
        companies: savedCompanies.length,
        supervisors: savedSupervisors.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des données' },
      { status: 500 }
    );
  }
}
