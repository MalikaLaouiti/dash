"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser"

interface ExcelUploaderProps {
  onDataLoad: (data: ParsedExcelData) => void
}

export function ExcelUploader({ onDataLoad }: ExcelUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string>("")
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
          onDataLoad(parsedData)

          // console.log("Données Excel importées:", parsedData)
          setUploadStatus("success")
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
  const saveToDatabase = async (parsedData: ParsedExcelData) => {
    const results = {
      students: { inserted: 0, failed: 0, total: 0 },
      companies: { inserted: 0, failed: 0, total: 0 },
      supervisors: { inserted: 0, failed: 0, total: 0 },
    };

    try {
      // Save students
      if (parsedData.students.length > 0) {
        console.log(`Enregistrement de ${parsedData.students.length} étudiants...`);

        const response = await fetch("/api/student/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: parsedData.students }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erreur lors de l'insertion des étudiants");
        }

        const result = await response.json();
        results.students = result.data;
        console.log(`Étudiants: ${result.data.inserted}/${result.data.total} insérés`);
      }

      // Save companies
      if (parsedData.companies.length > 0) {
        console.log(`Enregistrement de ${parsedData.companies.length} entreprises...`);

        const response = await fetch("/api/company/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companies: parsedData.companies }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Erreur entreprises:", error);
          // Don't throw - continue with supervisors
        } else {
          const result = await response.json();
          results.companies = result.data;
          console.log(`Entreprises: ${result.data.inserted}/${result.data.total} insérées`);
        }
      }

      // Save supervisors
      if (parsedData.supervisors.length > 0) {
        console.log(`Enregistrement de ${parsedData.supervisors.length} superviseurs...`);

        const response = await fetch("/api/supervisor/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supervisors: parsedData.supervisors }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Erreur superviseurs:", error);
          // Don't throw - at least some data was saved
        } else {
          const result = await response.json();
          results.supervisors = result.data;
          console.log(`Superviseurs: ${result.data.inserted}/${result.data.total} insérés`);
        }
      }

      // Log summary
      console.log("Résumé de l'import:", {
        étudiants: `${results.students.inserted}/${results.students.total}`,
        entreprises: `${results.companies.inserted}/${results.companies.total}`,
        superviseurs: `${results.supervisors.inserted}/${results.supervisors.total}`,
      });

      // Check if any insertions failed completely
      const totalExpected = parsedData.students.length + parsedData.companies.length + parsedData.supervisors.length;
      const totalInserted = results.students.inserted + results.companies.inserted + results.supervisors.inserted;

      if (totalInserted === 0 && totalExpected > 0) {
        throw new Error("Aucune donnée n'a pu être enregistrée");
      }

      return results;

    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      throw error;
    }
  }

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
    </div>
  )
}
