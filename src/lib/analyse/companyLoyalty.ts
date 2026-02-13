import Company from "@/models/Company";
import { CompanyLoyaltyResult } from "./types";

export default async function getCompanyLoyaltyAnalysis(
  years: string[],
  minYearsActive: number = 2,
  loyaltyThreshold: number = 2,
): Promise<CompanyLoyaltyResult[]> {
  const sortedYears = [...years].sort();

  const pipeline: any[] = [
    {
      $match: {
        year: { $in: sortedYears },
      },
    },

    { $unwind: "$companies" },

    {
      $match: {
        "companies.nom": { $exists: true, $ne: null },
        "companies.nombreStagiaires": { $exists: true, $gt: 0 },
      },
    },

    {
      $group: {
        _id: {
          companyKey: "$companies.nomNormalise",
          year: "$year",
        },
        companyName: { $first: "$companies.nom" },
        secteur: { $first: "$companies.secteur" },
        nombreStagiaires: { $sum: "$companies.nombreStagiaires" },
      },
    },

    {
      $group: {
        _id: "$_id.companyKey",
        companyName: { $first: "$companyName" },
        secteur: { $first: "$secteur" },
        effectifsParAnnee: {
          $push: {
            year: "$_id.year",
            count: "$nombreStagiaires",
          },
        },
        totalStagiaires: { $sum: "$nombreStagiaires" },
      },
    },

    {
      $addFields: {
        effectifsParAnnee: {
          $sortArray: {
            input: "$effectifsParAnnee",
            sortBy: { year: 1 },
          },
        },
      },
    },

    {
      $addFields: {
        anneesPresence: {
          $map: {
            input: "$effectifsParAnnee",
            as: "e",
            in: "$$e.year",
          },
        },
        nombreAnnees: { $size: "$effectifsParAnnee" },
        
        multiplicateurs: {
          $map: {
            input: "$effectifsParAnnee",
            as: "annee",
            in: {
              year: "$$annee.year",
              count: "$$annee.count",
              multiplicateur: {
                $round: [
                  {
                    $divide: [
                      "$$annee.count",
                      { $arrayElemAt: ["$effectifsParAnnee.count", 0] },
                    ],
                  },
                  2,
                ],
              },
            },
          },
        },

        scoreFidelite: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    { $size: "$effectifsParAnnee" },
                    sortedYears.length,
                  ],
                },
                100,
              ],
            },
            2,
          ],
        },
      },
    },

    {
      $match: {
        nombreAnnees: { $gte: minYearsActive },
      },
    },

    {
      $project: {
        _id: 0,
        companyName: 1,
        secteur: 1,
        anneesPresence: 1,
        nombreAnnees: 1,
        multiplicateurs: 1,
        scoreFidelite: 1,
        totalStagiaires: 1,
        croissanceConstante: 1,
        estFidele: 1,
        periodeAnalyse: {
          debut: { $arrayElemAt: [sortedYears, 0] },
          fin: { $arrayElemAt: [sortedYears, -1] },
        },
      },
    },

    {
      $sort: {
        croissanceConstante: -1,
        totalStagiaires: -1,
        companyName: 1,
      },
    },
  ];

  const results = await Company.aggregate(pipeline);
  console.log("Pipeline results:", results.length);
  return results as CompanyLoyaltyResult[];
}
