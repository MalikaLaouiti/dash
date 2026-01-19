"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Users, BookOpen, Briefcase, TrendingUp, Award } from "lucide-react"
import { useData } from "@/Context/DataContext";
import { SupervisorDTO } from "@/dto/supervisor.dto"
import { StudentDTO } from "@/dto/student.dto"


const mockData: SupervisorDTO[] = [
  { prenom: "Ahmed", annee: "2024", categorie: "professionnel", nombreEtudiants: 15, email: "ahmed@example.com" },
  { prenom: "Fatima", annee: "2024", categorie: "academique", nombreEtudiants: 12, email: "fatima@example.com" },
  { prenom: "Karim", annee: "2024", categorie: "professionnel", nombreEtudiants: 18, email: "karim@example.com" },
  { prenom: "Leila", annee: "2024", categorie: "academique", nombreEtudiants: 10, email: "leila@example.com" },
  { prenom: "Mohamed", annee: "2024", categorie: "professionnel", nombreEtudiants: 22, email: "mohamed@example.com" },
  { prenom: "Nadia", annee: "2023", categorie: "academique", nombreEtudiants: 14, email: "nadia@example.com" },
  { prenom: "Youssef", annee: "2023", categorie: "professionnel", nombreEtudiants: 16, email: "youssef@example.com" },
  { prenom: "Hana", annee: "2023", categorie: "academique", nombreEtudiants: 11, email: "hana@example.com" },
]

const mockStudents: StudentDTO[] = [
  {
    codeProjet: "P001",
    cin: 12345678,
    prenom: "Ali",
    filiere: "Informatique",
    annee: "2024",
    score: 18,
    encadreurProId: "Ahmed",
    collaboration: "monome",
  },
  {
    codeProjet: "P002",
    cin: 12345679,
    prenom: "Sara",
    filiere: "Informatique",
    annee: "2024",
    score: 17,
    encadreurProId: "Ahmed",
    collaboration: "monome",
  },
  {
    codeProjet: "P003",
    cin: 12345680,
    prenom: "Omar",
    filiere: "Informatique",
    annee: "2024",
    score: 19,
    encadreurProId: "Karim",
    collaboration: "monome",
  },
  {
    codeProjet: "P004",
    cin: 12345681,
    prenom: "Lina",
    filiere: "Informatique",
    annee: "2024",
    score: 20,
    encadreurProId: "Mohamed",
    collaboration: "monome",
  },
  {
    codeProjet: "P005",
    cin: 12345682,
    prenom: "Zaki",
    filiere: "Informatique",
    annee: "2024",
    score: 19.5,
    encadreurProId: "Mohamed",
    collaboration: "monome",
  },
  {
    codeProjet: "P006",
    cin: 12345683,
    prenom: "Mira",
    filiere: "Informatique",
    annee: "2024",
    score: 18.5,
    encadreurAcId: "Fatima",
    collaboration: "monome",
  },
  {
    codeProjet: "P007",
    cin: 12345684,
    prenom: "Bilel",
    filiere: "Informatique",
    annee: "2024",
    score: 19.5,
    encadreurAcId: "Fatima",
    collaboration: "monome",
  },
  {
    codeProjet: "P008",
    cin: 12345685,
    prenom: "Nour",
    filiere: "Informatique",
    annee: "2024",
    score: 17.5,
    encadreurAcId: "Leila",
    collaboration: "monome",
  },
]

export default function DashboardEncadrants() {
  const { parsedData, setParsedData, selectedYear, setSelectedYear } = useData();
  console.log("Parsed Data in Encadrants Dashboard:", parsedData);
  const supervisors = parsedData ? parsedData.supervisors : mockData
  const students = parsedData ? parsedData.students : mockStudents
  
  const stats = useMemo(() => {
    const total = supervisors.length
    const professionnel = supervisors.filter((s) => s.categorie === "professionnel").length
    const academique = supervisors.filter((s) => s.categorie === "academique").length
    const totalEtudiants = supervisors.reduce((sum, s) => sum + s.nombreEtudiants, 0)
    const moyenneEtudiants = Math.round(totalEtudiants / total)

    return { total, professionnel, academique, totalEtudiants, moyenneEtudiants }
  }, [supervisors])

  const categoryData = useMemo(() => {
    return [
      { name: "Professionnel", value: stats.professionnel, color: "hsl(var(--color-chart-1))" },
      { name: "Académique", value: stats.academique, color: "hsl(var(--color-chart-2))" },
    ]
  }, [stats])

  const professionnelData = useMemo(() => {
    return supervisors
      .filter((s) => s.categorie === "professionnel")
      .sort((a, b) => b.nombreEtudiants - a.nombreEtudiants)
      .map((s) => ({
        name: s.prenom,
        etudiants: s.nombreEtudiants,
      }))
  }, [supervisors])

  const academiqueData = useMemo(() => {
    return supervisors
      .filter((s) => s.categorie === "academique")
      .sort((a, b) => b.nombreEtudiants - a.nombreEtudiants)
      .map((s) => ({
        name: s.prenom,
        etudiants: s.nombreEtudiants,
      }))
  }, [supervisors])

  const yearData = useMemo(() => {
    const years = supervisors.reduce(
      (acc, s) => {
        const year = s.annee
        acc[year] = (acc[year] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(years)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, count]) => ({
        year,
        count,
      }))
  }, [supervisors])

  const topSupervisorsByScore = useMemo(() => {
    const supervisorScores = supervisors.map((supervisor) => {
      const supervisorStudents = students.filter(
        (student) => student.encadreurProId === supervisor.prenom || student.encadreurAcId === supervisor.prenom,
      )

      const avgScore =
        supervisorStudents.length > 0
          ? supervisorStudents.reduce((sum, s) => sum + (s.score || 0), 0) / supervisorStudents.length
          : 0

      return {
        nom: supervisor.prenom,
        categorie: supervisor.categorie,
        scoresMoyens: Number.parseFloat(avgScore.toFixed(2)),
        nombreEtudiants: supervisorStudents.length,
        email: supervisor.email || "-",
      }
    })

    return supervisorScores
      .filter((s) => s.nombreEtudiants > 0)
      .sort((a, b) => b.scoresMoyens - a.scoresMoyens)
      .slice(0, 5)
  }, [supervisors, students])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de Bord Encadrants</h1>
          <p className="text-muted-foreground">Analyse détaillée de la répartition et de la charge d'encadrement</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Encadrants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-chart-1" />
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Professionnels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-chart-1" />
                <div className="text-3xl font-bold">{stats.professionnel}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Académiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-chart-2" />
                <div className="text-3xl font-bold">{stats.academique}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Étudiants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-chart-3" />
                <div className="text-3xl font-bold">{stats.totalEtudiants}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Moyenne/Encadrant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-chart-4" />
                <div className="text-3xl font-bold">{stats.moyenneEtudiants}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Catégorie</CardTitle>
              <CardDescription>Distribution des encadrants</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Year Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution par Année</CardTitle>
              <CardDescription>Nombre d'encadrants par année</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="count" fill="hsl(var(--color-chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Encadrants par Score Moyen
            </CardTitle>
            <CardDescription>Les 5 meilleurs encadrants selon les scores moyens de leurs étudiants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topSupervisorsByScore.length > 0 ? (
                topSupervisorsByScore.map((supervisor, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-foreground">{supervisor.nom}</div>
                        <div
                          className={`text-xs font-medium mt-1 ${
                            supervisor.categorie === "professionnel" ? "text-chart-1" : "text-chart-2"
                          }`}
                        >
                          {supervisor.categorie === "professionnel" ? "Professionnel" : "Académique"}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-amber-500">#{idx + 1}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Score Moyen</span>
                        <span className="text-xl font-bold text-foreground">{supervisor.scoresMoyens}/20</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Étudiants</span>
                        <span className="font-semibold">{supervisor.nombreEtudiants}</span>
                      </div>
                      <div className="pt-2 border-t border-border text-xs text-muted-foreground truncate">
                        {supervisor.email}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  Aucune donnée de score disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Supervisors Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Encadrants Professionnels</CardTitle>
            <CardDescription>Nombre d'étudiants par encadrant (ordre décroissant)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={professionnelData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip />
                  <Bar dataKey="etudiants" fill="hsl(var(--color-chart-1))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Academic Supervisors Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Encadrants Académiques</CardTitle>
            <CardDescription>Nombre d'étudiants par encadrant (ordre décroissant)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={academiqueData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip />
                  <Bar dataKey="etudiants" fill="hsl(var(--color-chart-2))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste Complète des Encadrants</CardTitle>
            <CardDescription>Détails de tous les encadrants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold">Catégorie</th>
                    <th className="text-left py-3 px-4 font-semibold">Étudiants</th>
                    <th className="text-left py-3 px-4 font-semibold">Année</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.map((supervisor, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{supervisor.prenom}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            supervisor.categorie === "professionnel"
                              ? "bg-chart-1/10 text-chart-1"
                              : "bg-chart-2/10 text-chart-2"
                          }`}
                        >
                          {supervisor.categorie === "professionnel" ? "Professionnel" : "Académique"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{supervisor.nombreEtudiants}</td>
                      <td className="py-3 px-4">{supervisor.annee}</td>
                      <td className="py-3 px-4 text-muted-foreground">{supervisor.email || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
