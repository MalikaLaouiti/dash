import Student from "@/models/Student";
import { TopSupervisorResult } from "./types";

export default async function getTopSupervisors(
  year: string,
  categorie?: "professionnel" | "academique",
  limit: number = 10,
): Promise<TopSupervisorResult[]> {
  const validatedParams = {
    year,
    categorie,
    limit,
  };

  const results = await Student.aggregate([
  {
    $match: { year: validatedParams.year },
  },
  {
    $unwind: "$students",
  },
  // Lookup sur la collection supervisors (document entier)
  {
    $lookup: {
      from: "supervisors",
      pipeline: [
        { $match: { year: validatedParams.year } },
        { $unwind: "$supervisors" },
        // Projette chaque superviseur embarqué à plat
        {
          $replaceRoot: { newRoot: "$supervisors" }
        }
      ],
      as: "allSupervisors",
    },
  },
  // Trouver le bon superviseur par prenom (ou id commun)
  {
    $addFields: {
      supervisor: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$allSupervisors",
              as: "sup",
              cond: { $eq: ["$$sup.prenom", "$students.encadreurAcId"] }
            }
          },
          0
        ]
      }
    }
  },
  // Filtrer par catégorie si fourni
  ...(categorie
    ? [{ $match: { "supervisor.categorie": categorie } }]
    : []),
  {
    $group: {
      _id: "$students.encadreurAcId",
      prenom: { $first: "$supervisor.prenom" },
      email: { $first: "$supervisor.email" },
      categorie: { $first: "$supervisor.categorie" },
      annee: { $first: "$year" },
      moyenne: { $avg: "$students.score" },
      meilleureNote: { $max: "$students.score" },
      nbEtudiants: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      supervisorId: "$_id",
      prenom: 1,
      email: 1,
      categorie: 1,
      annee: 1,
      nombreEtudiants: "$nbEtudiants",
      moyenneNotes: { $round: ["$moyenne", 2] },
      meilleurNote: "$meilleureNote",
    },
  },
  {
    $sort: { moyenneNotes: -1 },
  },
  {
    $limit: validatedParams.limit,
  },
]);
  return results as TopSupervisorResult[];
}
