"use client"

import { AnalyticsTabs } from "@/components/AnalyticComponent/analytic-tabs";
import { Card, CardDescription, CardContent } from "@/components/ui/card";
import { useData } from "@/Context/DataContext";

export default function DashboardEncadrants() {

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <AnalyticsTabs/>
    </div>
  )
}
