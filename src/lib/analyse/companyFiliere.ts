import Student from '@/models/Student';
import {CompanyFiliereResult} from './types';

export default async function getCompanyFiliereAnalysis(
  year: string,
  minStudents: number = 1
): Promise<CompanyFiliereResult[]> {
  // Validation
  const validatedParams = { year, minStudents };

  
  const results = await Student.aggregate([
  {
    $match:
      {
        year: validatedParams.year
      }
  },
  {
    $unwind: "$students"
  },
  {
    $group: {
      _id: {
        filiere: "$students.filiere",
        companyId: "$students.companyId"
      },
      count: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      count: -1
    }
  },
  {
    $group: {
      _id: "$_id.filiere",
      companies: {
        $push: {
          companyId: "$_id.companyId",
          studentCount: "$count"
        }
      }
    }
  }
]);
  return results as CompanyFiliereResult[];;

}