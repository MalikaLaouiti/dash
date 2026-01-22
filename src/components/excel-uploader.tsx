"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser"
import { saveToDatabase , getFromDatabase } from "@/lib/load-upload"

interface ExcelUploaderProps {
  onDataLoad: (data: ParsedExcelData) => void,
  year:String
}

export function ExcelUploader({ onDataLoad, year }: ExcelUploaderProps) {
  console.log("ExcelUploader year prop:", year);
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setFileName(file.name)
    setUploadStatus("idle")

    try {
      const XLSX = await import("xlsx")
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          const sheets: any = {}
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName]
            sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          })

          const rawData = {
            sheets,
            sheetNames: workbook.SheetNames,
            fileName: file.name,
          }

          const parsedData = ExcelParser.parseExcelData(rawData)
          saveToDatabase(parsedData);
          setFileName("Données chargées depuis fichier Excel: ")
          onDataLoad(parsedData);
          setUploadStatus("success");
        } catch (error) {
          console.error("Erreur lors du parsing du fichier Excel:", error)
          setUploadStatus("error")
        } finally {
          setIsLoading(false)
        }
      }
      
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error("Erreur lors du chargement du fichier:", error)
      setIsLoading(false)
      setUploadStatus("error")
    }
  }

  const handleLoadFromDatabase = useCallback(async () => {
    setIsLoadingFromDB(true);
    setUploadStatus("idle");

    try {
      console.log("Chargement des données pour l'année:", year);
      const data = await getFromDatabase(year);
      console.log("Données reçues:", data);

      if (!data) {
        throw new Error("Aucune donnée trouvée");
      }

      const parsedData: ParsedExcelData = {
        students: data.students || [],
        companies: data.companies || [],
        supervisors: data.supervisors || [],
        summary: {
          totalStudents: data.students?.length || 0,
          totalCompanies: data.companies?.length || 0,
          totalSupervisors: data.supervisors?.length || 0,
          yearsCovered: data.summary?.yearsCovered || [year],
        },
      };

      onDataLoad(parsedData);
      setFileName(`Données ${year} chargées depuis la base de données`);
      setUploadStatus("success");
    } catch (error) {
      setUploadStatus("error");
      setFileName("");
    } finally {
      setIsLoadingFromDB(false);
    }
  }, [year, onDataLoad]);

  // Recharger automatiquement quand year change
  useEffect(() => {
    console.log(" Year a changé:", year);
    if (year) {
      handleLoadFromDatabase();
    }
  }, [year]);

  return (
    <div className="flex items-center gap-4">
      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4 ml-3" />
          <span >{fileName}</span>
          {uploadStatus === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
          {uploadStatus === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
      )}

      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        <Button variant="outline" size="sm" disabled={isLoading} className="gap-2 bg-transparent">
          <Upload className="h-4 w-4" />
          {isLoading ? "Chargement..." : "Importer Excel"}
        </Button>
      </div>
      
      <div className="relative">
        <Button variant="outline" size="sm" disabled={isLoading} className="gap-2 bg-transparent" onClick={handleLoadFromDatabase}>
          <Save className="h-4 w-4" />
          {isLoading ? "Chargement..." : "données sauvegardées"}
        </Button>  
      </div>
      
    </div>
  )
}
