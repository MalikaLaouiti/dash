"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Building2, Users, Award, Calendar, Star } from "lucide-react";

interface AnalysisData {
  companiesByYear: { year: string; count: number }[];
  topSupervisors: { name: string; students: number; averageScore: number }[];
  topStudents: { name: string; score: number; year: string; project: string }[];
  scoreDistribution: { range: string; count: number }[];
  collaborationStats: { type: string; count: number; percentage: number }[];
  yearlyStats: {
    year: string;
    students: number;
    companies: number;
    supervisors: number;
    averageScore: number;
  }[];
}

export default function AnalysePage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyse');
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
        if (data.yearlyStats.length > 0) {
          setSelectedYear(data.yearlyStats[0].year);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <AppSidebar 
            selectedYear={selectedYear || undefined}
            onYearSelect={handleYearSelect}
            availableYears={analysisData?.yearlyStats.map(s => s.year) || []}
          />
          <main className="flex-1 flex flex-col overflow-hidden">
            <SidebarTrigger />
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Chargement des données d'analyse...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!analysisData) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <AppSidebar 
            selectedYear={selectedYear || undefined}
            onYearSelect={handleYearSelect}
            availableYears={[]}
          />
          <main className="flex-1 flex flex-col overflow-hidden">
            <SidebarTrigger />
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">Aucune donnée d'analyse disponible</p>
                <p className="text-sm text-muted-foreground mt-2">Importez d'abord des données Excel</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar 
          selectedYear={selectedYear || undefined}
          onYearSelect={handleYearSelect}
          availableYears={analysisData.yearlyStats.map(s => s.year)}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <SidebarTrigger />
          
          <div className="flex items-center justify-between mb-4 p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">Analyse des Données Académiques</h1>
              {selectedYear && (
                <Badge variant="default" className="text-sm">
                  Année: {selectedYear}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="companies">Entreprises</TabsTrigger>
                <TabsTrigger value="supervisors">Encadreurs</TabsTrigger>
                <TabsTrigger value="students">Étudiants</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Statistiques générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analysisData.yearlyStats.reduce((sum, stat) => sum + stat.students, 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Entreprises</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analysisData.yearlyStats.reduce((sum, stat) => sum + stat.companies, 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analysisData.yearlyStats.length > 0 
                          ? (analysisData.yearlyStats.reduce((sum, stat) => sum + stat.averageScore, 0) / analysisData.yearlyStats.length).toFixed(2)
                          : "N/A"
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Années Couvertes</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysisData.yearlyStats.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphique d'évolution par année */}
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des Données par Année</CardTitle>
                    <CardDescription>Nombre d'étudiants, entreprises et encadreurs par année</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analysisData.yearlyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="students" stroke="#8884d8" name="Étudiants" />
                        <Line type="monotone" dataKey="companies" stroke="#82ca9d" name="Entreprises" />
                        <Line type="monotone" dataKey="supervisors" stroke="#ffc658" name="Encadreurs" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Distribution des notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution des Notes</CardTitle>
                    <CardDescription>Répartition des scores obtenus par les étudiants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analysisData.scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="companies" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Entreprises par Année</CardTitle>
                    <CardDescription>Nombre d'entreprises partenaires par année universitaire</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analysisData.companiesByYear}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="supervisors" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 Encadreurs</CardTitle>
                    <CardDescription>Encadreurs avec le plus d'étudiants et meilleure moyenne</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisData.topSupervisors.slice(0, 10).map((supervisor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{supervisor.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {supervisor.students} étudiant{supervisor.students > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold">{supervisor.averageScore.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 Étudiants</CardTitle>
                    <CardDescription>Meilleurs scores par année</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisData.topStudents.slice(0, 10).map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.project}</p>
                              <p className="text-xs text-muted-foreground">Année: {student.year}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold text-lg">{student.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Types de Collaboration</CardTitle>
                    <CardDescription>Répartition entre binômes et monômes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analysisData.collaborationStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} (${percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analysisData.collaborationStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
