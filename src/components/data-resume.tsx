import { ParsedExcelData } from "@/lib/excel-parser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export default function DataResume({parsedData, searchQuery, selectedYear}:{parsedData:ParsedExcelData, searchQuery:string, selectedYear:string}) {
    return (
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
                        {parsedData.summary.yearsCovered.map((year: string) => (
                            <Badge
                                key={year?.toString() || "yyyy"}
                                variant={year === selectedYear ? "default" : "outline"}
                                className="mr-2"
                            >
                                {year}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    )
};