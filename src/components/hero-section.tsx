import { useData } from "@/Context/DataContext";
import { ExcelParser } from "@/lib/excel-parser";
import { saveToDatabase } from "@/lib/load-upload";
import type React from "react"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { UsageInstructions } from "./usage-instructions";


export default function Hero_section() {
    const [isLoading, setIsLoading] = useState(false)
    const { setParsedData } = useData();
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
            reader.onload = async (e) => {
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
                    setFileName("Données chargées depuis fichier Excel: " + file.name)
                    const parsedData = ExcelParser.parseExcelData(rawData)
                    await saveToDatabase(parsedData);
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


    return (

        <div className="flex items-center justify-between mb-4 p-6 border-b border-border">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">Dashboard d&apos;Analyse Académique</h1>
            </div>
            <div className="flex items-center gap-2">
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

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1">
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] backdrop-blur-sm" align="end">
                        <UsageInstructions />
                    </PopoverContent>
                </Popover>
            </div>

        </div>
    );
};