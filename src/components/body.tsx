"use client";

import { DataTable } from "@/components/data-table";
import { JsonPreview } from "@/components/json-preview";
import { UsageInstructions } from "@/components/usage-instructions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { type ParsedExcelData } from "@/lib/excel-parser";
import { useData } from "@/Context/DataContext";
import { getFromDatabase } from "@/lib/load-upload";

interface TabConfig {
    id: string;
    label: string;
    count: number;
    content: React.ReactNode;
}

export default function Body() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchFilters, setSearchFilters] = useState({
        students: true,
        companies: true,
        supervisors: true,
    });
    const { parsedData, setParsedData, selectedYear } = useData();
    const [activeTab, setActiveTab] = useState<string>("students");
    const [searchResults, setSearchResults] = useState<ParsedExcelData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {

            setIsLoading(true);
            setError(null);

            try {
                const data = await getFromDatabase(selectedYear!);
                
                if (!data) {
                    setError("Aucune donnée trouvée pour l'année sélectionnée");
                    return;
                }

                const parsingData: ParsedExcelData = {
                    students: data.students || [],
                    companies: data.companies || [],
                    supervisors: data.supervisors || [],
                    summary: {
                        totalStudents: data.students?.length || 0,
                        totalCompanies: data.companies?.length || 0,
                        totalSupervisors: data.supervisors?.length || 0,
                        yearsCovered: data.summary?.yearsCovered || [selectedYear],
                    },
                };
                console.log("Données chargées depuis la base de données:", parsingData.supervisors);
                setParsedData(parsingData);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Erreur lors du chargement des données");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [selectedYear]); 

    const displayData = useMemo(() => {
        return searchResults || parsedData;
    }, [searchResults, parsedData]);

    const dynamicTabs = useMemo((): TabConfig[] => {
        if (!parsedData) return [];

        const academicSupervisors = parsedData.supervisors.filter(s => s.categorie === "academique");
        const professionalSupervisors = parsedData.supervisors.filter(s => s.categorie === "professionnel");

        return [
            {
                id: "students",
                label: "Étudiants",
                count: parsedData.students.length,
                content: (
                    <DataTable
                        data={displayData}
                        activeTab="students"
                        selectedYear={selectedYear || undefined}
                        searchQuery={searchQuery}
                        searchFilters={searchFilters}
                    />
                ),
            },
            {
                id: "companies",
                label: "Entreprises",
                count: parsedData.companies.length,
                content: (
                    <DataTable
                        data={displayData}
                        activeTab="companies"
                        selectedYear={selectedYear || undefined}
                        searchQuery={searchQuery}
                        searchFilters={searchFilters}
                    />
                ),
            },
            {
                id: "supervisors-academic",
                label: "Encadreurs Académiques",
                count: academicSupervisors.length,
                content: (
                    <DataTable
                        data={displayData}
                        activeTab="supervisors-academic"
                        selectedYear={selectedYear || undefined}
                        searchQuery={searchQuery}
                        searchFilters={searchFilters}
                    />
                ),
            },
            {
                id: "supervisors-professional",
                label: "Encadreurs Professionnels",
                count: professionalSupervisors.length,
                content: (
                    <DataTable
                        data={displayData}
                        activeTab="supervisors-professional"
                        selectedYear={selectedYear || undefined}
                        searchQuery={searchQuery}
                        searchFilters={searchFilters}
                    />
                ),
            },
            {
                id: "json",
                label: "JSON",
                count: 0,
                content: <JsonPreview data={displayData} />,
            },
        ];
    }, [parsedData, displayData, selectedYear, searchQuery, searchFilters]);

    if (isLoading) {
        return (
            <div className="flex-1 overflow-auto p-9 space-y-2">
                <div className="text-center text-muted-foreground">
                    Chargement des données...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 overflow-auto p-9 space-y-2">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Erreur</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto p-9 space-y-2">
            {!parsedData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Aucune donnée chargée</CardTitle>
                        <CardDescription>
                            Veuillez importer un fichier Excel pour commencer l&apos;analyse.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {parsedData && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Résumé des données importées
                                <Badge variant="secondary">
                                    {parsedData.students.length + 
                                     parsedData.companies.length + 
                                     parsedData.supervisors.length} éléments
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                {searchQuery
                                    ? `Résultats filtrés pour "${searchQuery}"`
                                    : "Données extraites du fichier Excel et organisées par catégorie"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4">
                                <span className="text-sm text-muted-foreground">Années couvertes: </span>
                                {parsedData.summary.yearsCovered.map(year => (
                                    <Badge 
                                        key={year} 
                                        variant={year === selectedYear ? "default" : "outline"} 
                                        className="mr-2"
                                    >
                                        {year}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {dynamicTabs.length > 0 && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${dynamicTabs.length}, 1fr)` }}>
                                {dynamicTabs.map((tab) => (
                                    <TabsTrigger key={tab.id} value={tab.id}>
                                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {dynamicTabs.map((tab) => (
                                <TabsContent key={tab.id} value={tab.id} className="mt-6">
                                    {tab.content}
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </>
            )}
        </div>
    );
}