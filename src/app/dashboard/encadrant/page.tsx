"use client"

import { Card, CardDescription, CardContent } from "@/components/ui/card";
import { useData } from "@/Context/DataContext";

export default function DashboardEncadrants() {

  const { parsedData, setParsedData, selectedYear, setSelectedYear } = useData();
  console.log("Parsed Data in Encadrant Page:", parsedData);

  return (
    <div>
      {parsedData ?
        <Card>
          <CardDescription>Données chargées</CardDescription>
          <CardContent>
            <div>Nombre d'encadrants: {parsedData?.supervisors.length}</div>
          </CardContent>
        </Card> : <div>Aucune donnée chargée</div>
      }
    </div>
  )
}
