"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser"
import { SupervisorDTO } from "@/dto/supervisor.dto"
import { StudentDTO } from "@/dto/student.dto"
import { CompanyDTO } from "@/dto/company.dto"

interface ExcelUploaderProps {
  onDataLoad: (data: ParsedExcelData) => void
}

export function ExcelUploader({ onDataLoad }: ExcelUploaderProps) {
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
      }

      // Save companies
      if (parsedData.companies.length > 0) {
        const response = await fetch("/api/company/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companies: parsedData.companies }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Erreur entreprises:", error);
        } else {
          const result = await response.json();
          results.companies = result.data;
          console.log(`Entreprises: ${result.data.inserted}/${result.data.total} insérées`);
        }
      }

      // Save supervisors
      if (parsedData.supervisors.length > 0) {
        const response = await fetch("/api/supervisor/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supervisors: parsedData.supervisors }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Erreur superviseurs:", error);

        } else {
          const result = await response.json();
          results.supervisors = result.data;
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

  const handleLoadFromDatabase = async () => {
    setIsLoadingFromDB(true)
    setUploadStatus("idle")

    try {
      const data = await getFromDatabase()
  
      const parsedData: ParsedExcelData = {
        students: data.students,
        companies: data.companies,
        supervisors: data.supervisors,
        summary: {
          totalStudents: data.students.length,
          totalCompanies: data.companies.length,
          totalSupervisors: data.supervisors.length,
          yearsCovered: data.summary.yearsCovered,
        },
      }

      onDataLoad(parsedData)
      setFileName("Données chargées depuis la base de données")
      setUploadStatus("success")
    } catch (error) {
      setUploadStatus("error")
    } finally {
      setIsLoadingFromDB(false)
    }
  }

  
  const getFromDatabase = async () => {
    try {

      const studentsRes = await fetch("/api/student/batch", {
        method: "GET",
        
      });
      
      const supervisorsRes= await fetch("/api/supervisor/batch", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }); 
      
      const companiesRes = await fetch("/api/company/batch", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!studentsRes.ok || !supervisorsRes.ok || !companiesRes.ok) {
        throw new Error("Erreur lors de la récupération des données")
      }

      const studentsData = await studentsRes.json()
      const supervisorsData = await supervisorsRes.json()
      const companiesData = await companiesRes.json()

      const yearsSet = new Set<string>()
      studentsData.data.forEach((s: StudentDTO) => yearsSet.add(s.annee))
      companiesData.data.forEach((c: CompanyDTO) => yearsSet.add(c.annee))
      supervisorsData.data.forEach((s: SupervisorDTO) => yearsSet.add(s.annee))

      return {
        students: studentsData.data as StudentDTO[],
        companies: companiesData.data as CompanyDTO[],
        supervisors: supervisorsData.data as SupervisorDTO[],
        summary: {
          totalStudents: studentsData.data.length,
          totalCompanies: companiesData.data.length,
          totalSupervisors: supervisorsData.data.length,
          yearsCovered: Array.from(yearsSet).sort().reverse(),
        },
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error)
      throw error
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
      <div className="relative">
        <Button variant="outline" size="sm" disabled={isLoading} className="gap-2 bg-transparent" onClick={handleLoadFromDatabase}>
          <Save className="h-4 w-4" />
          {isLoading ? "Chargement..." : "données sauvegardées"}
        </Button>
        
      </div>
    </div>
  )
}
