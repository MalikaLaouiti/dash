"use client"

import { AnalyticsTabs } from "@/components/AnalyticComponent/analytic-tabs";
import { Card, CardDescription, CardContent } from "@/components/ui/card";
import { useData } from "@/Context/DataContext";

export default function DashboardEncadrants() {

  const { parsedData, setParsedData, selectedYear, setSelectedYear } = useData();

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {parsedData ?
        <Card>
          <CardDescription>Données chargées</CardDescription>
          <CardContent>
            <div>Nombre d'encadrants: {parsedData?.supervisors.length}</div>
          </CardContent>
        </Card> : <div>Aucune donnée chargée</div>
      }
      <AnalyticsTabs/>
    </div>
  )
}
