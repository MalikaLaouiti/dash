import Student from "@/models/Student";
import Company from "@/models/Company";
import { CompanyFiliereResult } from "./types";

export default async function getCompanyFilieres(
  year: string,
): Promise<CompanyFiliereResult[]> {

  const results = await Student.aggregate([
    {
      $match: { year },
    },
    {
      $unwind: "$students",
    },
    // Grouper par filière + companyId avec stats
    {
      $group: {
        _id: {
          filiere: "$students.filiere",
          companyId: "$students.companyId",
        },
        studentCount: { $sum: 1 },
        moyenneNotes: { $avg: "$students.score" },
      },
    },
    // Lookup pour récupérer les infos de l'entreprise
    {
      $lookup: {
        from: "companies",
        let: { companyId: "$_id.companyId", year: year },
        pipeline: [
          { $match: { $expr: { $eq: ["$year", "$$year"] } } },
          { $unwind: "$companies" },
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$companies.nom", "$$companyId"] },
                  { $eq: ["$companies.nomNormalise", "$$companyId"] },
                ],
              },
            },
          },
          {
            $project: {
              nom: "$companies.nom",
              secteur: "$companies.secteur",
            },
          },
        ],
        as: "companyInfo",
      },
    },
    {
      $addFields: {
        companyData: { $arrayElemAt: ["$companyInfo", 0] },
      },
    },
    // Grouper par filière
    {
      $group: {
        _id: "$_id.filiere",
        companies: {
          $push: {
            companyId: "$_id.companyId",
            companyName: {
              $ifNull: ["$companyData.nom", "$_id.companyId"],
            },
            secteur: {
              $ifNull: ["$companyData.secteur", "Non renseigné"],
            },
            nombreEtudiants: "$studentCount",
            moyenneNotes: { $round: ["$moyenneNotes", 2] },
          },
        },
        totalEtudiants: { $sum: "$studentCount" },
      },
    },
    {
      $sort: { totalEtudiants: -1 },
    },
  ]);

  // Transformer pour correspondre à CompanyFiliereResult[]
  return results.flatMap((filiere) =>
    filiere.companies.map((company: any) => ({
      companyId: company.companyId,
      companyName: company.companyName,
      secteur: company.secteur,
      totalEtudiants: company.nombreEtudiants,
      annee: year,
      filieres: [
        {
          filiere: filiere._id,
          nombreEtudiants: company.nombreEtudiants,
          moyenneNotes: company.moyenneNotes,
        },
      ],
    }))
  ) as CompanyFiliereResult[];
}