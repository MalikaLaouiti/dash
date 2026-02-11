import mongoose from 'mongoose';

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

export interface CompanyFiliereResult {
  companyId: string;
  companyName: string;
  secteur: string;
  filieres: {
    filiere: string;
    nombreEtudiants: number;
    moyenneNotes: number;
  }[];
  totalEtudiants: number;
  annee: string;
}

export interface CompanyLoyaltyResult {
  companyId: string;
  companyName: string;
  secteur: string;
  anneesActivite: string[];
  nombreAnneesActive: number;
  totalEtudiantsAccueillis: number;
  estFidele: boolean;
  tauxRetention: number;
}

export interface CompanyCapacityResult {
  companyId: string;
  companyName: string;
  secteur: string;
  capaciteDeclaree: number;
  nombreEtudiantsReel: number;
  tauxOccupation: number;
  categorie: 'grande' | 'moyenne' | 'petite';
  annee: string;
}

export interface YearComparisonResult {
  parAnnee: {
    annee: string;
    totalEtudiants: number;
    totalEntreprises: number;
    totalEncadrants: number;
    moyenneNotesGlobale: number;
  }[];
  tendances: {
    croissanceEtudiants: number;
    croissanceEntreprises: number;
    evolutionNotes: number;
  };
}

export interface AggregationResult {
  supervisorId?: string;
  nombreEtudiants: number;
  moyenneNotes: number;
  meilleurNote: number;
  totalNotes?: number;
  countNotes?: number;
  _id?: string | mongoose.Types.ObjectId;
}

export interface SupervisorInfo {
  _id: mongoose.Types.ObjectId;
  prenom: string;
  email?: string;
  categorie: 'professionnel' | 'academique';
}

export interface CompanyInfo {
  _id: mongoose.Types.ObjectId;
  nom: string;
  secteur: string;
  nombreStagiaires?: number;
}

export interface StudentStats {
  companyId: string;
  filiere: string;
  nombreEtudiants: number;
  moyenneNotes: number;
  totalNotes?: number;
  countNotes?: number;
}

export interface SupervisorStatsData extends AggregationResult {
  type?: 'academique' | 'professionnel';
}

export type SupervisorStatsMap = Map<string, SupervisorStatsData>;
export type SupervisorInfoMap = Map<string, SupervisorInfo>;
export type CompanyInfoMap = Map<string, CompanyInfo>;