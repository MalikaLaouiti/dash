'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { Users, Award, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TopSupervisorResult {
  supervisorId: string;
  prenom: string;
  email: string;
  categorie: 'professionnel' | 'academique';
  nombreEtudiants: number;
  moyenneNotes: number;
  meilleurNote: number;
  annee: string;
}

// Mock data based on the provided JSON structure
const mockData: TopSupervisorResult[] = [
  {
    supervisorId: '1',
    prenom: 'Kais Ben Salah',
    email: 'kais.bensalah@example.com',
    categorie: 'academique',
    nombreEtudiants: 13,
    moyenneNotes: 14.77,
    meilleurNote: 17,
    annee: '2024',
  },
  {
    supervisorId: '2',
    prenom: 'Sami Bhiri',
    email: 'sami.bhiri@example.com',
    categorie: 'academique',
    nombreEtudiants: 2,
    moyenneNotes: 14.75,
    meilleurNote: 17,
    annee: '2024',
  },
  {
    supervisorId: '3',
    prenom: 'Samer Lahouar',
    email: 'samer.lahouar@example.com',
    categorie: 'academique',
    nombreEtudiants: 1,
    moyenneNotes: 14,
    meilleurNote: 14,
    annee: '2024',
  },
  {
    supervisorId: '4',
    prenom: 'Riadh Ayach',
    email: 'riadh.ayach@example.com',
    categorie: 'academique',
    nombreEtudiants: 2,
    moyenneNotes: 13,
    meilleurNote: 13,
    annee: '2024',
  },
  {
    supervisorId: '5',
    prenom: 'Nadi Bali',
    email: 'nadi.bali@example.com',
    categorie: 'academique',
    nombreEtudiants: 1,
    moyenneNotes: 13,
    meilleurNote: 13,
    annee: '2024',
  },
];

export function ClassementSuperviseurs({ data }: { data: TopSupervisorResult[] }) {
  const [filterCategorie, setFilterCategorie] = useState<'all' | 'academique' | 'professionnel'>('all');
  const [sortBy, setSortBy] = useState<'students' | 'moyenne' | 'note'>('students');

  const filteredData = filterCategorie === 'all'
    ? data
    : data.filter((s) => s.categorie === filterCategorie);

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'students') return b.nombreEtudiants - a.nombreEtudiants;
    if (sortBy === 'moyenne') return b.moyenneNotes - a.moyenneNotes;
    return b.meilleurNote - a.meilleurNote;
  });

  // KPI Calculations
  const totalEtudiants = filteredData.reduce((sum, s) => sum + s.nombreEtudiants, 0);
  const averageMoyenne =
    filteredData.length > 0
      ? filteredData.reduce((sum, s) => sum + s.moyenneNotes, 0) / filteredData.length
      : 0;
  const topSupervisor = sortedData[0];
  const academiqueSupervisors = filteredData.filter((s) => s.categorie === 'academique').length;

  // Chart data - supervisors by students
  const chartData = sortedData.slice(0, 10).map((s) => ({
    name: s.prenom,
    etudiants: s.nombreEtudiants,
    moyenne: s.moyenneNotes,
  }));

  // Chart data - student distribution scatter
  const scatterData = sortedData.map((s) => ({
    name: s.prenom,
    x: s.nombreEtudiants,
    y: s.moyenneNotes,
    categorie: s.categorie,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Classement Superviseurs</h2>
        <p className="text-sm text-muted-foreground">
          Performance et analyse détaillée des superviseurs académiques et professionnels
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Superviseurs</p>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{filteredData.length}</p>
            <p className="text-xs text-muted-foreground">
              {academiqueSupervisors} académiques
            </p>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Étudiants</p>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{totalEtudiants}</p>
            <p className="text-xs text-muted-foreground">
              {(totalEtudiants / filteredData.length).toFixed(1)} par superviseur
            </p>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Moyenne Générale</p>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{averageMoyenne.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">/20</p>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Top Superviseur</p>
            <p className="text-xl font-bold text-foreground truncate">{topSupervisor?.prenom}</p>
            <p className="text-xs text-muted-foreground">
              {topSupervisor?.nombreEtudiants} étudiants
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterCategorie} onValueChange={(value: any) => setFilterCategorie(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les superviseurs</SelectItem>
            <SelectItem value="academique">Académiques</SelectItem>
            <SelectItem value="professionnel">Professionnels</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="students">Nombre d'étudiants</SelectItem>
            <SelectItem value="moyenne">Moyenne des notes</SelectItem>
            <SelectItem value="note">Meilleure note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - Students */}
        <Card className="p-6 border border-border/50 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribution des Étudiants
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="etudiants" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Scatter Chart - Students vs Moyenne */}
        <Card className="p-6 border border-border/50 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Étudiants vs Moyenne
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" dataKey="x" name="Étudiants" stroke="var(--color-muted-foreground)" />
              <YAxis type="number" dataKey="y" name="Moyenne" stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter
                name="Académique"
                data={scatterData.filter((d) => d.categorie === 'academique')}
                fill="var(--color-primary)"
              />
              <Scatter
                name="Professionnel"
                data={scatterData.filter((d) => d.categorie === 'professionnel')}
                fill="var(--color-primary)/60"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Supervisors Table */}
      <Card className="p-6 border border-border/50 bg-card overflow-x-auto">
        <h3 className="text-lg font-semibold text-foreground mb-4">Détail des Superviseurs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Nom</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Catégorie</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Étudiants</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Moyenne</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Meilleur</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((supervisor) => (
                <tr
                  key={supervisor.supervisorId}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">{supervisor.prenom}</p>
                      <p className="text-xs text-muted-foreground">{supervisor.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={supervisor.categorie === 'academique' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {supervisor.categorie}
                    </Badge>
                  </td>
                  <td className="text-center py-3 px-4 text-foreground">
                    <span className="font-semibold">{supervisor.nombreEtudiants}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-semibold text-foreground">
                      {supervisor.moyenneNotes}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 font-semibold text-sm">
                      {supervisor.meilleurNote}/20
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
