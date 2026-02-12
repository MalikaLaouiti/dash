import Student from '@/models/Student';
import {CompanyFiliereResult} from './types';

export default async function getCompanyFiliereAnalysis(
  year: string,
): Promise<CompanyFiliereResult[]> {


  const results = await Student.aggregate([
  {
    $match:
      {
        year: year
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