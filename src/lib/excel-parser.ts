import { createStudentsBatch } from '@/app/api/student/route';
import { createCompaniesBatch } from '@/app/api/company/route';
import { createSupervisorsBatch } from '@/app/api/supervisor/route';
import { StudentDTO } from '@/dto/student.dto';
import { SupervisorDTO } from '@/dto/supervisor.dto';
import {CompanyDTO} from '@/dto/company.dto'; 

// export interface Student {
//   codeProjet: string;
//   cin: number;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   filiere: string;
//   annee: string;
//   titreProjet?: string;
//   score?: number;
//   companyId?: string;
//   localisation_type?: "interne" | "externe";
//   encadreurAcId?: string;
//   encadreurProId?: string;
//   dureeStage?: string;
//   debutStage?: Date;
//   finStage?: Date;
//   collaboration: "binome" | "monome";
//   ficheInformation?: string;
//   cahierCharge?: string;
// }

// export interface Company {
//   nom: string;
//   secteur: string;
//   adresse?: string;
//   contact?: string;
//   email?: string;
//   telephone?: string;
//   annee: string;
// }

// export interface Supervisor {
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   annee: string;
//   categorie: "professionnel" | "academique";
// }

export interface ParsedExcelData {
  students: StudentDTO[];
  companies: CompanyDTO[];
  supervisors: SupervisorDTO[];
  summary: {
    totalStudents: number;
    totalCompanies: number;
    totalSupervisors: number;
    yearsCovered: string[];
  };
}

export class ExcelParser {
  private static readonly HEADER_MAPPINGS = {
    students: {
      codeProject: ["code projet", "code"],
      cin: ["cin"],
      prenom: ["prenom"],
      filiere: ["filiére", "specialisation", "filiére"],
      email: ["email", "mail"],
      telephone: ["téléphone", "phone number"],
      titreProjet: ["titre du sujet"],
      score: ["score", "note"],
      companyId: ["société", "entreprise", "company"],
      localisationType: ["type", "interne/externe"],
      encadreurAc: ["encadrant isimm", "academic supervisor", "professeur"],
      encadreurPro: ["encadrant professionnel", "professional supervisor"],
      dureeStage: ["durée stage", "duree", "duration"],
      debutStage: ["début stage", "debut", "start"],
      finStage: ["fin stage", "end"],
      collaboration: ["group type"],
      ficheInformation: ["fiche", "fiche d'informations scannée"],
      cahierCharge: ["cahier charges", "charge"]
    },
    companies: {
      nom: ["société"],
      secteur: ["domaine d'activités", "secteur", "sector"],
      adresse: ["adresse de société", "address"],
      contact: ["e-mail encadrant professionnel", "contact"],
      email: ["email", "mail"],
      telephone: ["phone number encadrant professionnel", "telephone", "phone"],
      encadrantPro: ["encadrant professionnel", "professional supervisor"]
    },
    supervisors: {
      prenomAc: ["encadrant isimm"],
      emailAc: ["e-mail encadrant isimm"],
      telephoneAc: ["phone number encadrant isimm"],
      prenomPro: ["encadrant professionnel"],
      emailPro: ["e-mail encadrant professionnel"],
      telephonePro: ["phone number encadrant professionnel"]
    }
  };


  private static findColumnIndex(headers: string[], aliases: string[]): number {
    return headers.findIndex(header => 
      aliases.some(alias => header.includes(alias))
    );
  }


  private static extractColumnIndices(headers: string[], type: keyof typeof ExcelParser.HEADER_MAPPINGS) {
    const indices: Record<string, number> = {};
    const mappings = ExcelParser.HEADER_MAPPINGS[type];

    for (const [key, aliases] of Object.entries(mappings)) {
      indices[key] = this.findColumnIndex(headers, aliases);
    }

    return indices;
  }


  private static parseDate(dateValue: any): Date | undefined {
    if (!dateValue) return undefined;
    
    // Gérer les dates Excel (numériques)
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return isNaN(date.getTime()) ? undefined : date;
    }
    
    // Gérer les dates string
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? undefined : date;
  }


  private static cleanString(value: any): string {
    if (value == null) return '';
    return String(value).trim();
  }


  private static cleanNumber(value: any): number {
    if (value == null) return 0;
    
    const num = Number(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  private static parseStudents(data: any[][], year: string): StudentDTO[] {
    if (data.length < 2) return [];

    const headers = data[0].map(h => this.cleanString(h).toLowerCase());
    const indices = this.extractColumnIndices(headers, 'students');
    const students: StudentDTO[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const student: StudentDTO = {
        codeProjet: indices.codeProject >= 0 ? this.cleanString(row[indices.codeProject]) : '',
        cin: indices.cin >= 0 ? this.cleanNumber(row[indices.cin]) : 0,
        prenom: indices.prenom >= 0 ? this.cleanString(row[indices.prenom]) : '',
        filiere: indices.filiere >= 0 ? this.cleanString(row[indices.filiere]) : '',
        annee: year,
        email: indices.email >= 0 ? this.cleanString(row[indices.email]) || undefined : undefined,
        telephone: indices.telephone >= 0 ? this.cleanString(row[indices.telephone]) || undefined : undefined,
        titreProjet: indices.titreProjet >= 0 ? this.cleanString(row[indices.titreProjet]) || undefined : undefined,
        score: indices.score >= 0 ? this.cleanNumber(row[indices.score]) || undefined : undefined,
        companyId: indices.companyId >= 0 ? this.cleanString(row[indices.companyId]) || undefined : undefined,
        localisation_type: this.determineLocalisationType(row, indices.localisationType),
        encadreurAcId: indices.encadreurAc >= 0 ? this.cleanString(row[indices.encadreurAc]) || undefined : undefined,
        encadreurProId: indices.encadreurPro >= 0 ? this.cleanString(row[indices.encadreurPro]) || undefined : undefined,
        dureeStage: indices.dureeStage >= 0 ? this.cleanString(row[indices.dureeStage]) || undefined : undefined,
        debutStage: indices.debutStage >= 0 ? this.parseDate(row[indices.debutStage])?.toString() : undefined,
        finStage: indices.finStage >= 0 ? this.parseDate(row[indices.finStage])?.toString() : undefined,
        collaboration: this.determineCollaboration(row, indices.collaboration),
        ficheInformation: indices.ficheInformation >= 0 ? this.cleanString(row[indices.ficheInformation]) || undefined : undefined,
        cahierCharge: indices.cahierCharge >= 0 ? this.cleanString(row[indices.cahierCharge]) || undefined : undefined,
      };

      if (this.isValidStudent(student)) {
        students.push(student);
      }
    }

    return students;
  }

  private static determineLocalisationType(row: any[], index: number): "interne" | "externe" | undefined {
    if (index < 0) return undefined;
    
    const value = this.cleanString(row[index]).toLowerCase();
    return value.includes("interne") ? "interne" : "externe";
  }


  private static determineCollaboration(row: any[], index: number): "binome" | "monome" {
    if (index < 0) return "monome";
    
    const value = this.cleanString(row[index]).toLowerCase();
    return value.includes("binôme") || value.includes("binome") ? "binome" : "monome";
  }


  private static isValidStudent(student: StudentDTO): boolean {
    return !!(student.prenom && student.codeProjet && student.cin);
  }

  
  private static parseCompanies(data: any[][], year: string): CompanyDTO[] {
    if (data.length < 2) return [];

    const headers = data[0].map(h => this.cleanString(h).toLowerCase());
    const indices = this.extractColumnIndices(headers, 'companies');
    const companies: CompanyDTO[] = [];
    const seenCompanies = new Set<string>();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const company: CompanyDTO = {
        nom: indices.nom >= 0 ? this.cleanString(row[indices.nom]) : '',
        secteur: indices.secteur >= 0 ? this.cleanString(row[indices.secteur]) : '',
        annee: year,
        adresse: indices.adresse >= 0 ? this.cleanString(row[indices.adresse]) || undefined : undefined,
        contact: indices.contact >= 0 ? this.cleanString(row[indices.contact]) || undefined : undefined,
        email: indices.email >= 0 ? this.cleanString(row[indices.email]) || undefined : undefined,
        telephone: indices.telephone >= 0 ? this.cleanString(row[indices.telephone]) || undefined : undefined,
      };

      // Éviter les doublons basés sur le nom
      const companyKey = `${company.nom.toLowerCase()}_${year}`;
      if (company.nom && !seenCompanies.has(companyKey)) {
        companies.push(company);
        seenCompanies.add(companyKey);
      }
    }

    return companies;
  }

  
  private static parseSupervisors(data: any[][], year: string): SupervisorDTO[] {
    if (data.length < 2) return [];

    const headers = data[0].map(h => this.cleanString(h).toLowerCase());
    const indices = this.extractColumnIndices(headers, 'supervisors');
    const supervisors: SupervisorDTO[] = [];
    const seenSupervisors = new Set<string>();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // Superviseur académique
      if (indices.prenomAc >= 0) {
        const prenomAc = this.cleanString(row[indices.prenomAc]);
        if (prenomAc) {
          const supervisor: SupervisorDTO = {
            prenom: prenomAc,
            annee: year,
            email: indices.emailAc >= 0 ? this.cleanString(row[indices.emailAc]) || undefined : undefined,
            telephone: indices.telephoneAc >= 0 ? this.cleanString(row[indices.telephoneAc]) || undefined : undefined,
            categorie: "academique" as const,
          };

          const supervisorKey = `${supervisor.prenom.toLowerCase()}_academique_${year}`;
          if (!seenSupervisors.has(supervisorKey)) {
            supervisors.push(supervisor);
            seenSupervisors.add(supervisorKey);
          }
        }
      }

      // Superviseur professionnel
      if (indices.prenomPro >= 0) {
        const prenomPro = this.cleanString(row[indices.prenomPro]);
        if (prenomPro) {
          const supervisor: SupervisorDTO = {
            prenom: prenomPro,
            annee: year,
            email: indices.emailPro >= 0 ? this.cleanString(row[indices.emailPro]) || undefined : undefined,
            telephone: indices.telephonePro >= 0 ? this.cleanString(row[indices.telephonePro]) || undefined : undefined,
            categorie: "professionnel" as const,
          };

          const supervisorKey = `${supervisor.prenom.toLowerCase()}_professionnel_${year}`;
          if (!seenSupervisors.has(supervisorKey)) {
            supervisors.push(supervisor);
            seenSupervisors.add(supervisorKey);
          }
        }
      }
    }

    return supervisors;
  }

 
  static parseExcelData(rawExcelData: any): ParsedExcelData {
    const students: StudentDTO[] = [];
    const companies: CompanyDTO[] = [];
    const supervisors: SupervisorDTO[] = [];
    const yearsCovered: Set<string> = new Set();

    if (!rawExcelData?.sheets) {
      return this.createEmptyResult();
    }

    // Traiter chaque feuille
    for (const [sheetName, sheetData] of Object.entries(rawExcelData.sheets)) {
      if (!Array.isArray(sheetData) || sheetData.length === 0) continue;

      // Extraire l'année du nom de la feuille
      const year = this.extractYearFromSheetName(sheetName);
      yearsCovered.add(year);

      students.push(...this.parseStudents(sheetData as any[][], year));
      companies.push(...this.parseCompanies(sheetData as any[][], year));
      supervisors.push(...this.parseSupervisors(sheetData as any[][], year));
    }

    // Sauvegarder dans la base de données
    // this.saveToDatabase(students, companies, supervisors);

    return {
      students,
      companies,
      supervisors,
      summary: {
        totalStudents: students.length,
        totalCompanies: companies.length,
        totalSupervisors: supervisors.length,
        yearsCovered: Array.from(yearsCovered).sort().reverse(),
      },
    };
  }

  private static extractYearFromSheetName(sheetName: string): string {
    const yearMatch = sheetName.match(/20\d{2}/);
    return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
  }

  private static createEmptyResult(): ParsedExcelData {
    return {
      students: [],
      companies: [],
      supervisors: [],
      summary: {
        totalStudents: 0,
        totalCompanies: 0,
        totalSupervisors: 0,
        yearsCovered: [],
      },
    };
  }

  /**
   * Sauvegarde les données dans la base de données
   */
  // private static async saveToDatabase(
  //   students: Student[], 
  //   companies: Company[], 
  //   supervisors: Supervisor[]
    
  // ): Promise<void> {
  //   try {
  //     console.log('students to save:', students.length);
  //     console.log('companies to save:', companies.length);
  //     console.log('supervisors to save:', supervisors.length);
  //     if (students.length > 0) {
  //       if (await createStudentsBatch(students)){
  //         console.log('Students saved successfully');
  //       }
  //       else{
  //         console.log('No students were saved');
  //       }
  //     }
  //     if (companies.length > 0) {
  //       if( await createCompaniesBatch(companies)){
  //         console.log('Companies saved successfully');
  //       }else{
  //         console.log('No companies were saved');
  //       }
  //     }
  //     if (supervisors.length > 0) {
  //       if (await createSupervisorsBatch(supervisors))
  //       {
  //         console.log('Supervisors saved successfully');
  //       }else{
  //         console.log('No supervisors were saved');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error saving to database:', error);
  //     throw error;
  //   }
  // }
}