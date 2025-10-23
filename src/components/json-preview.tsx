"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser"

interface JsonPreviewProps {
  data: ParsedExcelData | null
}

export function JsonPreview({ data }: JsonPreviewProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    if (!data) return
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
    }
  }

  const handleDownload = () => {
    if (!data) return
    
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "excel-data.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prévisualisation JSON</CardTitle>
          <CardDescription>
            Importez un fichier Excel pour voir la structure JSON générée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucune donnée à prévisualiser
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prévisualisation JSON</CardTitle>
            <CardDescription>
              Structure JSON générée à partir du fichier Excel
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copié!" : "Copier"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Badge variant="secondary">
            {data.summary.totalStudents} étudiants
          </Badge>
          <Badge variant="secondary">
            {data.summary.totalCompanies} entreprises
          </Badge>
          <Badge variant="secondary">
            {data.summary.totalSupervisors.total} encadreurs
          </Badge>
          <Badge variant="outline">
            {data.summary.yearsCovered.length} année(s): {data.summary.yearsCovered.join(", ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4 max-h-96 overflow-auto">
          <pre className="text-sm">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
