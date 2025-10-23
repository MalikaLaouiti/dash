import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Company from '@/models/Company';
import Supervisor from '@/models/Supervisor';
import { ExcelParser, ParsedExcelData } from '@/lib/excel-parser';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { rawExcelData } = body;

    if (!rawExcelData) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Parser les données Excel
    const parsedData: ParsedExcelData = ExcelParser.parseExcelData(rawExcelData);

    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        
        // 1. Sauvegarder les entreprises avec leurs encadrants professionnels
        const companyMap = new Map<string, any>();
        
        for (const company of parsedData.companies) {
          const encadrantsPro = parsedData.supervisors
            .filter(s => s.categorie === 'professionnel')
            .map(s => ({
              id: new mongoose.Types.ObjectId().toString(),
              prenom: s.prenom,
              annee: s.annee,
              nombreEtudiants: s.nombreEtudiants || 0,
              categorie: 'professionnel' as const,
              email: s.email,
              telephone: s.telephone
            }));

          const savedCompany = await Company.create([{
            nom: company.nom,
            secteur: company.secteur,
            annee: company.annee,
            adresse: company.adresse,
            contact: company.contact,
            email: company.email,
            telephone: company.telephone,
            nombreStagiaires: company.nombreStagiaires || 0,
            encadrantPro: encadrantsPro
          }], { session });

          companyMap.set(company.nom, savedCompany[0]);
        }

        // 2. Sauvegarder les encadrants académiques
        const supervisorMap = new Map<string, any>();
        
        const academicSupervisors = parsedData.supervisors
          .filter(s => s.categorie === 'academique');

        for (const supervisor of academicSupervisors) {
          const savedSupervisor = await Supervisor.create([{
            prenom: supervisor.prenom,
            email: supervisor.email,
            telephone: supervisor.telephone,
            nombreEtudiants: supervisor.nombreEtudiants || 0,
            annee: supervisor.annee,
            categorie: 'academique' as const
          }], { session });

          supervisorMap.set(supervisor.prenom, savedSupervisor[0]);
        }

        // 3. Sauvegarder les étudiants avec références
        const studentsToInsert = parsedData.students.map(student => {
          const company = companyMap.get(student.companyId || '');
          const academicSupervisor = supervisorMap.get(student.encadreurAcId || '');
          
          // Trouver l'encadrant professionnel dans la company
          let encadreurProId: string | undefined;
          if (company && student.encadreurProId) {
            const encadrantPro = company.encadrantPro.find(
              (e: any) => e.prenom === student.encadreurProId
            );
            encadreurProId = encadrantPro?.id;
          }

          return {
            codeProjet: student.codeProjet,
            cin: student.cin,
            prenom: student.prenom,
            email: student.email,
            telephone: student.telephone,
            filiere: student.filiere,
            annee: student.annee,
            titreProjet: student.titreProjet,
            score: student.score,
            companyId: company?._id.toString(),
            localisation_type: student.localisation_type,
            encadreurAcId: academicSupervisor?._id.toString(),
            encadreurProId: encadreurProId,
            dureeStage: student.dureeStage,
            debutStage: student.debutStage,
            finStage: student.finStage,
            collaboration: student.collaboration,
            collaborateur: student.collaborateur ? {
              codeProjet: student.collaborateur.codeProjet,
              cin: student.collaborateur.cin,
              prenom: student.collaborateur.prenom,
              filiere: student.collaborateur.filiere,
              annee: student.collaborateur.annee,
              collaboration: 'binome' as const
            } : undefined,
            ficheInformation: student.ficheInformation,
            cahierCharge: student.cahierCharge
          };
        });

        await Student.insertMany(studentsToInsert, { session });

      });

      await session.commitTransaction();

      return NextResponse.json({ 
        success: true,
        summary: {
          students: parsedData.students.length,
          companies: parsedData.companies.length,
          supervisors: parsedData.supervisors.filter(s => s.categorie === 'academique').length,
          professionalSupervisors: parsedData.supervisors.filter(s => s.categorie === 'professionnel').length,
          yearsCovered: parsedData.summary?.yearsCovered || []
        }
      });

    } catch (transactionError) {
      await session.abortTransaction();
      console.error('Transaction error:', transactionError);
      throw transactionError;
    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Error saving structured data:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}