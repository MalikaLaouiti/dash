import { StudentDTO } from "@/dto/student.dto";
import { SupervisorDTO } from "@/dto/supervisor.dto";
import { CompanyDTO } from "@/dto/company.dto";

export function normalizeCompanyName(name: string): string {
  if (!name || typeof name !== "string") return "";
  const cleaned = name.trim();
  if (cleaned.length === 0) return "";
  return cleaned
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, "")
    .replace("societe", "")
    .trim();
}


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
      cahierCharge: ["cahier charges", "charge"],
    },
    companies: {
      nom: ["société"],
      secteur: ["domaine d'activités", "secteur", "sector"],
      adresse: ["adresse de société", "address"],
      email: ["e-mail encadrant professionnel"],
      telephone: ["phone number encadrant professionnel"],
      encadrantPro: ["encadrant professionnel", "professional supervisor"],
    },
    supervisors: {
      prenomAc: ["encadrant isimm"],
      emailAc: ["e-mail encadrant isimm"],
      telephoneAc: ["phone number encadrant isimm"],
      prenomPro: ["encadrant professionnel"],
      emailPro: ["e-mail encadrant professionnel"],
      telephonePro: ["phone number encadrant professionnel"],
    },
  };

  private static findColumnIndex(headers: string[], aliases: string[]): number {
    return headers.findIndex((header) =>
      aliases.some((alias) => header.includes(alias))
    );
  }

  private static extractColumnIndices(
    headers: string[],
    type: keyof typeof ExcelParser.HEADER_MAPPINGS
  ) {
    const indices: Record<string, number> = {};
    const mappings = ExcelParser.HEADER_MAPPINGS[type];

    for (const [key, aliases] of Object.entries(mappings)) {
      indices[key] = this.findColumnIndex(headers, aliases);
    }
    return indices;
  }

  private static cleanString(value: any): string {
    if (value == null) return "";
    return String(value).trim();
  }
 
   private static cleanNumber(value: any): number {
    if (value == null) return 0;
    
    const num = Number(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
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

  private static parseStudents(data: any[][], year: string): StudentDTO[] {
    if (data.length < 2) return [];

    const headers = data[0].map((h) => this.cleanString(h).toLowerCase());
    const indices = this.extractColumnIndices(headers, "students");
    const students: StudentDTO[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const student: StudentDTO = {
        codeProjet:
          indices.codeProject >= 0
            ? this.cleanString(row[indices.codeProject])
            : "",
        cin: indices.cin >= 0 ? this.cleanNumber(row[indices.cin]) : 0,
        prenom:
          indices.prenom >= 0 ? this.cleanString(row[indices.prenom]) : "",
        filiere:
          indices.filiere >= 0 ? this.cleanString(row[indices.filiere]) : "",
        annee: year,
        email:
          indices.email >= 0
            ? this.cleanString(row[indices.email]) || undefined
            : undefined,
        telephone:
          indices.telephone >= 0
            ? this.cleanString(row[indices.telephone]) || undefined
            : undefined,
        titreProjet:
          indices.titreProjet >= 0
            ? this.cleanString(row[indices.titreProjet]) || undefined
            : undefined,
        score:
          indices.score >= 0
            ? this.cleanNumber(row[indices.score]) || undefined
            : undefined,
        companyId:
          indices.companyId >= 0
            ? this.cleanString(row[indices.companyId]) || undefined
            : undefined,
        localisation_type: this.determineLocalisationType(
          row,
          indices.localisationType
        ),
        encadreurAcId:
          indices.encadreurAc >= 0
            ? this.cleanString(row[indices.encadreurAc]) || undefined
            : undefined,
        encadreurProId:
          indices.encadreurPro >= 0
            ? this.cleanString(row[indices.encadreurPro]) || undefined
            : undefined,
        dureeStage:
          indices.dureeStage >= 0
            ? this.cleanString(row[indices.dureeStage]) || undefined
            : undefined,
        debutStage:
          indices.debutStage >= 0
            ? this.parseDate(row[indices.debutStage])?.toString()
            : undefined,
        finStage:
          indices.finStage >= 0
            ? this.parseDate(row[indices.finStage])?.toString()
            : undefined,
        collaboration: this.determineCollaboration(row, indices.collaboration),
        ficheInformation:
          indices.ficheInformation >= 0
            ? this.cleanString(row[indices.ficheInformation]) || undefined
            : undefined,
        cahierCharge:
          indices.cahierCharge >= 0
            ? this.cleanString(row[indices.cahierCharge]) || undefined
            : undefined,
      };

      if (this.isValidStudent(student)) {
        students.push(student);
      }
    }

    return students;
  }

  private static determineLocalisationType(
    row: any[],
    index: number
  ): "interne" | "externe" | undefined {
    if (index < 0) return undefined;

    const value = this.cleanString(row[index]).toLowerCase();
    return value.includes("interne") ? "interne" : "externe";
  }

  private static determineCollaboration(
    row: any[],
    index: number
  ): "binome" | "monome" {
    if (index < 0) return "monome";

    const value = this.cleanString(row[index]).toLowerCase();
    return value.includes("binôme") || value.includes("binome")
      ? "binome"
      : "monome";
  }

  private static isValidStudent(student: StudentDTO): boolean {
    return !!(student.prenom && student.codeProjet && student.cin);
  }

  private static parseCompanies(data: any[][], year: string): CompanyDTO[] {
    if (data.length < 2) return [];

    const headers = data[0].map((h) => this.cleanString(h).toLowerCase());
    const indices = this.extractColumnIndices(headers, "companies");
    const companiesMap = new Map<string, CompanyDTO>();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const nomBrut =
        indices.nom >= 0 ? this.cleanString(row[indices.nom]) : "";
      if (!nomBrut) continue;

      const nomNormalise = normalizeCompanyName(nomBrut);
      const companyKey = `${nomNormalise}_${year}`;

      if (!companiesMap.has(companyKey)) {
        const company: CompanyDTO = {
          nom: nomBrut,
          secteur:
            indices.secteur >= 0 ? this.cleanString(row[indices.secteur]) : "",
          annee: year,
          nomNormalise: nomNormalise,
          adresse:
            indices.adresse >= 0
              ? this.cleanString(row[indices.adresse]) || undefined
              : undefined,
          email:
            indices.emailPro >= 0
              ? [this.cleanString(row[indices.emailPro])]
              : undefined,
          telephone:
            indices.telephonePro >= 0
              ? [this.cleanString(row[indices.telephonePro])]
              : undefined,
          encadrantPro:
            indices.encadrantPro >= 0
              ? [this.cleanString(row[indices.encadrantPro]).toLowerCase()]
              : undefined,
          nombreStagiaires: 1,
          lastActivity: new Date().toISOString(),
        };

        companiesMap.set(companyKey, company);
      } else {
        const existingCompany = companiesMap.get(companyKey)!;
        existingCompany.nombreStagiaires += 1;
        existingCompany.lastActivity = new Date().toISOString();

        if (indices.email >= 0 && row[indices.email]) {
          const newEmail = this.cleanString(row[indices.email]);
          if (newEmail && !existingCompany.email?.includes(newEmail)) {
            if (!existingCompany.email) existingCompany.email = [];
            existingCompany.email.push(newEmail);
          }
        }
        if (indices.telephone >= 0 && row[indices.telephone]) {
          const newTelephone = this.cleanString(row[indices.telephone]);
          if (
            newTelephone &&
            !existingCompany.telephone?.includes(newTelephone)
          ) {
            if (!existingCompany.telephone) existingCompany.telephone = [];
            existingCompany.telephone.push(newTelephone);
          }
        }
        if (indices.encadrantPro >= 0 && row[indices.encadrantPro]) {
          const newEncadrant = this.cleanString(row[indices.encadrantPro]).toLowerCase();
          if (
            newEncadrant &&
            !existingCompany.encadrantPro?.includes(newEncadrant)
          ) {
            if (!existingCompany.encadrantPro)
              existingCompany.encadrantPro = [];
            existingCompany.encadrantPro.push(newEncadrant);
          }
        }
      }
    }
    // Convertir la Map en tableau
    const companies = Array.from(companiesMap.values());
    return companies;
  }

  private static parseSupervisors(
    data: any[][],
    year: string
  ): SupervisorDTO[] {
    if (data.length < 2) return [];

    const headers = data[0].map((h) => this.cleanString(h).toLowerCase());
    const indices = this.extractColumnIndices(headers, "supervisors");
    const supervisorsMap = new Map<string, SupervisorDTO>();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // Superviseur académique
      if (indices.prenomAc >= 0) {
        const prenomAc = this.cleanString(row[indices.prenomAc]);
        const supervisorACKey = `${prenomAc}_academique_${year}`;
        if (!supervisorsMap.has(supervisorACKey)) {
          const supervisor: SupervisorDTO = {
            prenom: prenomAc,
            annee: year,
            email:
              indices.emailAc >= 0
                ? this.cleanString(row[indices.emailAc]) || undefined
                : undefined,
            nombreEtudiants: 1,
            telephone:
              indices.telephoneAc >= 0
                ? this.cleanString(row[indices.telephoneAc]) || undefined
                : undefined,
            categorie: "academique" as const,
          };
          supervisorsMap.set(supervisorACKey, supervisor);
        }
        else {
        const existingSupervisorAC = supervisorsMap.get(supervisorACKey)!;
        existingSupervisorAC.nombreEtudiants += 1;
        }
      }

      // Superviseur professionnel
      if (indices.prenomPro >= 0) {
        const prenomPro = this.cleanString(row[indices.prenomPro]);
        const supervisorPROKey = `${prenomPro}_professionnel_${year}`;
        if(!supervisorsMap.has(supervisorPROKey)) {
          const supervisor: SupervisorDTO = {
            prenom: prenomPro,
            annee: year,
            email:
              indices.emailPro >= 0
                ? this.cleanString(row[indices.emailPro]) || undefined
                : undefined,
            nombreEtudiants: 1,
            telephone:
              indices.telephonePro >= 0
                ? this.cleanString(row[indices.telephonePro]) || undefined
                : undefined,
            categorie: "professionnel" as const,
          };
          supervisorsMap.set(supervisorPROKey, supervisor);
        }
        else {
          const existingSupervisorAC = supervisorsMap.get(supervisorPROKey)!;
          existingSupervisorAC.nombreEtudiants += 1;
        }
      }
    }
    const supervisors = Array.from(supervisorsMap.values());
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

    for (const [sheetName, sheetData] of Object.entries(rawExcelData.sheets)) {
      if (!Array.isArray(sheetData) || sheetData.length === 0) continue;

      const year = this.extractYearFromSheetName(sheetName);
      yearsCovered.add(year);

      students.push(...this.parseStudents(sheetData as any[][], year));
      companies.push(...this.parseCompanies(sheetData as any[][], year));
      supervisors.push(...this.parseSupervisors(sheetData as any[][], year));
    }

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
    const yearMatch = sheetName.match(/(?<=-)\d{4}/);
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
}
