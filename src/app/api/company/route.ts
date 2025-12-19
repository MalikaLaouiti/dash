"use server";
import Company from '@/models/Company';
import { connectDB } from '@/lib/mongodb';
import { CompanyDTO } from '@/dto/company.dto';
import { serializeMongoDoc } from '@/lib/serializers';
import Student from '@/models/Student';

export async function getCompanies():Promise<CompanyDTO[]> {
    try {
        await connectDB();
        const companies = await Company.find();
        return serializeMongoDoc(companies);
    }
    catch (error) {
        console.error('Failed to fetch companies:', error);
        throw error;
    }
}
export async function createCompany(companyData: any):Promise<CompanyDTO> {
    try {
        await connectDB();
        const company = await Company.create(companyData);
        return serializeMongoDoc(company);
    }
    catch (error) {
        console.error('Failed to create company:', error);
        throw error;
    }
}

export async function createCompaniesBatch(companiesData: any[]):Promise<CompanyDTO[]> {
    try {
        await connectDB();
        const companies = await Company.insertMany(companiesData, { ordered: false });
        return serializeMongoDoc(companies);
    }   
    catch (error) {
        console.error('Failed to create companies batch:', error);
        throw error;
    }
}

export async function getCompanyPerformance() {
  return await Student.aggregate([
    {
      $lookup: {
        from: 'companies',
        localField: 'companyId',
        foreignField: '_id',
        as: 'company'
      }
    },
    { $unwind: '$company' },
    {
      $group: {
        _id: '$companyId',
        companyNom: { $first: '$company.nom' },
        secteur: { $first: '$company.secteur' },
        nombreStagiaires: { $sum: 1 },
        moyenneNotes: { $avg: '$note' },
        tauxReussite: {
          $avg: {
            $cond: [{ $gte: ['$note', 10] }, 1, 0]
          }
        },
        notesExcellentes: {
          $sum: {
            $cond: [{ $gte: ['$note', 16] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        companyId: '$_id',
        companyNom: 1,
        secteur: 1,
        nombreStagiaires: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        tauxReussite: { $round: [{ $multiply: ['$tauxReussite', 100] }, 2] },
        tauxExcellence: {
          $round: [
            { $multiply: [{ $divide: ['$notesExcellentes', '$nombreStagiaires'] }, 100] },
            2
          ]
        }
      }
    },
    { $sort: { moyenneNotes: -1 } },
    { $limit: 30 }
  ]);
}

export async function getTopCompanies(year?: string | null) {
  const matchStage = year ? { annee: parseInt(year) } : {};
  
  return await Student.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$companyId',
        nombreStagiaires: { $sum: 1 },
        moyenneNotes: { $avg: '$note' },
        notesDistribution: {
          $push: '$note'
        }
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: '_id',
        foreignField: '_id',
        as: 'company'
      }
    },
    { $unwind: '$company' },
    {
      $project: {
        _id: 0,
        companyId: '$_id',
        companyNom: '$company.nom',
        secteur: '$company.secteur',
        nombreStagiaires: 1,
        moyenneNotes: { $round: ['$moyenneNotes', 2] },
        score: {
          $add: [
            { $multiply: ['$nombreStagiaires', 0.6] },
            { $multiply: ['$moyenneNotes', 0.4] }
          ]
        }
      }
    },
    { $sort: { score: -1, nombreStagiaires: -1 } },
    { $limit: 50 }
  ]);
}

