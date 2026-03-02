"use client";

import { DataTable } from "@/components/DataTable/data-table";
import { JsonPreview } from "@/components/DataTable/json-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { type ParsedExcelData } from "@/lib/excel-parser";
import { useData } from "@/Context/DataContext";
import { getFromDatabase } from "@/lib/load-upload";
import { Skeleton } from "@/components/ui/skeleton";
import DataResume from "./data-resume";

interface TabConfig {
    id: string;
    label: string;
    count: number;
    content: React.ReactNode;
}

interface MainProps {
    searchQuery?: string;
    searchFilters?: {
        students: boolean;
        companies: boolean;
        supervisors: boolean;
    };
}

export default function Main({ searchQuery, searchFilters }: MainProps) {
    const { parsedData, setParsedData, selectedYear } = useData();
    const [activeTab, setActiveTab] = useState<string>("students");
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

    // ✅ Filtrage correct basé sur parsedData (remplace allData inexistant)
    const filteredData = useMemo((): ParsedExcelData | null => {
        if (!parsedData) return null;

        // Si pas de query, retourner les données filtrées par type seulement
        const q = searchQuery?.toLowerCase().trim();

        const filteredStudents =
            searchFilters?.students !== false
                ? q
                    ? parsedData.students.filter(
                          (s: any) =>
                              s.cin?.toString().includes(q) ||
                              s.nom?.toLowerCase().includes(q) ||
                              s.prenom?.toLowerCase().includes(q) ||
                              s.filiere?.toLowerCase().includes(q) ||
                              s.sujet?.toLowerCase().includes(q) ||
                              s.entreprise?.toLowerCase().includes(q) ||
                              s.encadreur_academique?.toLowerCase().includes(q)

                      )
                    : parsedData.students
                : [];

        const filteredCompanies =
            searchFilters?.companies !== false
                ? q
                    ? parsedData.companies.filter((c: any) =>
                          c.nom?.toLowerCase().includes(q) ||
                          c.secteur?.toLowerCase().includes(q)
                      )
                    : parsedData.companies
                : [];

        const filteredSupervisors =
            searchFilters?.supervisors !== false
                ? q
                    ? parsedData.supervisors.filter(
                          (sv: any) =>
                              sv.nom?.toLowerCase().includes(q) ||
                              sv.prenom?.toLowerCase().includes(q) ||
                              sv.departement?.toLowerCase().includes(q)
                      )
                    : parsedData.supervisors
                : [];

        return {
            students: filteredStudents,
            companies: filteredCompanies,
            supervisors: filteredSupervisors,
            summary: {
                totalStudents: filteredStudents.length,
                totalCompanies: filteredCompanies.length,
                totalSupervisors: filteredSupervisors.length,
                yearsCovered: parsedData.summary.yearsCovered,
            },
        };
    }, [parsedData, searchQuery, searchFilters]);

    const displayData = filteredData;

    const dynamicTabs = useMemo((): TabConfig[] => {
        if (!parsedData || !displayData) return [];

        const academicSupervisors = displayData.supervisors.filter(
            (s: any) => s.categorie === "academique"
        );
        const professionalSupervisors = displayData.supervisors.filter(
            (s: any) => s.categorie === "professionnel"
        );

        return [
            {
                id: "students",
                label: "Étudiants",
                count: displayData.students.length,
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
                count: displayData.companies.length,
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
            <Card className="p-9 m-9 space-y-2">
                <CardHeader>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video w-full" />
                </CardContent>
            </Card>
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

            {parsedData && displayData && (
                <>
                    <DataResume
                        parsedData={displayData}
                        searchQuery={searchQuery || ""}
                        selectedYear={selectedYear}
                    />
                    {dynamicTabs.length > 0 && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList
                                className="grid w-full"
                                style={{
                                    gridTemplateColumns: `repeat(${dynamicTabs.length}, 1fr)`,
                                }}
                            >
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