import Student from "@/models/Student";

export async function getTopSupervisors(year: string, limit: number = 10) {
  console.log('🔍 Recherche pour année:', year);
  
  const results = await Student.aggregate([
  { $match: { year } },
  { $unwind: '$students' },
  { 
    $lookup: {
      from: 'supervisors',
      localField: 'students.encadreurAcId',
      foreignField: 'supervisors._id',
      as: 'supervisor'
    }
  },
  {
    $group: {
      _id: '$students.encadreurAcId',
      nombreEtudiants: { $sum: 1 },
      moyenneNotes: { $avg: '$students.score' },
      maxNote: { $max: '$students.score' },
      listeNotes: { $push: '$students.score' }, 
      
    }
  },
  { $sort: { nombreEtudiants: -1, moyenneNotes: -1 } },
  { $limit: limit }
]);
  
  console.log('📊 Nombre de résultats:', results.length);
  console.log('📋 Résultats complets:', JSON.stringify(results, null, 2));
  
  // Affichage formaté
  results.forEach((r, index) => {
    console.log(`\n--- Top ${index + 1} ---`);
    console.log(`ID: ${r._id}`);
    console.log(`Étudiants: ${r.nombreEtudiants}`);
    console.log(`Moyenne: ${r.moyenneNotes?.toFixed(2)}`);
    console.log(`Notes: [${r.listeNotes.join(', ')}]`);
  });
  
  return results;
}