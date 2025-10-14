export interface Student {
  codeProjet: string
  cin: number
  prenom: string
  email?: string
  telephone?: string
  filiere: string
  annee: string
  titreProjet?: string
  score?: number
  companyId?: string
  localisation_type?: "interne" | "externe"
  encadreurAcId?: string
  encadreurProId?: string
  dureeStage?: string
  debutStage?: Date
  finStage?: Date
  collaboration: "binome" | "monome"
  collaborateur?: Student
  ficheInformation?: string
  cahierCharge?: string
}

export interface Company {
  id: string
  nom: string
  secteur: string
  encadrantPro :Supervisor[]
  adresse?: string
  contact?: string
  email?: string
  telephone?: string
  nombreStagiaires: number
  annee: string
}


export interface Supervisor {
  id: string
  prenom: string
  email?: string
  telephone?: string
  nombreEtudiants: number
  annee: string
  categorie: "professionnel" | "academique"
}

export interface ParsedExcelData {
  students: Student[]
  companies: Company[]
  supervisors: Supervisor[]
  rawData: any
  summary: {
    totalStudents: number
    totalCompanies: number
    totalSupervisors: {
      academiques: number
      professionnels: number
      total: number
    }
    yearsCovered: string[]
    collaborations: {
      binomes: number
      monomes: number
    }
    localisations: {
      internes: number
      externes: number
    }
  }
}

export class ExcelParser {
  // private static detectDataType(headers: string[]): "students" | "companies" | "supervisors" | "unknown" {
  //   const safeHeaders = headers.filter((h) => h != null).map((h) => String(h).toLowerCase())
  //   const headerStr = safeHeaders.join(" ")
   

  //   // Detect students data
  //   if (
  //     (headerStr.includes("nom") || headerStr.includes("cin") || headerStr.includes("code projet"))
  //   ) {
  //     return "students"
  //   }

  //   // Detect companies data
  //   if (headerStr.includes("société") || headerStr.includes("entreprise") || headerStr.includes("Host")) {
  //     return "companies"
  //   }

  //   // Detect supervisors data
  //   if (headerStr.includes("encadrant isimm") || headerStr.includes("Academic Supervisor") || headerStr.includes("professeur")) {
  //     return "supervisors"
  //   }

  //   return "unknown"
  // }
  
  private static parseStudents(data: any[][], year: string): Student[] {
    if (data.length < 2) return []

    const headers = (data[0] || []).map((h: any) => (h != null ? String(h).toLowerCase() : ""))
    const students: Student[] = []

    // Find column indices with safe string operations
    const indices = {
      codeProject: headers.findIndex((h) => h && (h.includes("code projet"))),
      cin: headers.findIndex((h) => h && h.includes("cin")),
      nom: headers.findIndex((h) => h && h.includes("nom")),
      prenom: headers.findIndex((h) => h && h.includes("prenom")),
      specialisation: headers.findIndex((h) => h && (h.includes("specialisation") || h.includes("filiére"))),
      societe: headers.findIndex((h) => h && (h.includes("société") || h.includes("entreprise"))),
      encadreur: headers.findIndex((h) => h && (h.includes("Encadrant ISIMM") )),
      email: headers.findIndex((h) => h && (h.includes("email") || h.includes("mail"))),
      telephone: headers.findIndex((h) => h && (h.includes("téléphone") || h.includes("phone number"))),
      score: headers.findIndex((h) => h && (h.includes("score") || h.includes("note"))),
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const student: Student = {
        id: `student_${year}_${i}`,
        codeProjet: indices.codeProject >= 0 ? String(row[indices.codeProject]) : "",
        cin: indices.cin >= 0 ? Number(row[indices.cin]) || 0 : 0,
        nom: row[indices.nom] || "",
        prenom: row[indices.prenom] || "",
        specialisation: row[indices.specialisation] || "",
        annee: year,
        societe: indices.societe >= 0 ? row[indices.societe] : undefined,
        encadreur: indices.encadreur >= 0 ? row[indices.encadreur] : undefined,
        email: indices.email >= 0 ? row[indices.email] : undefined,
        telephone: indices.telephone >= 0 ? row[indices.telephone] : undefined,
        score: indices.score >= 0 ? row[indices.score] : undefined,
      }

      if (student.nom || student.prenom) {
        students.push(student)
      }
    }

    return students
  }

  private static parseCompanies(data: any[][], year: string): Company[] {
    if (data.length < 2) return []

    const headers = (data[0] || []).map((h: any) => (h != null ? String(h).toLowerCase() : ""))
    const companies: Company[] = []

    const indices = {
      nom: headers.findIndex((h) => h && (h.includes("nom") || h.includes("societe") || h.includes("entreprise"))),
      secteur: headers.findIndex((h) => h && (h.includes("secteur") || h.includes("domaine"))),
      adresse: headers.findIndex((h) => h && h.includes("adresse")),
      contact: headers.findIndex((h) => h && h.includes("contact") && !h.includes("email")),
      email: headers.findIndex((h) => h && (h.includes("email") || h.includes("mail"))),
      telephone: headers.findIndex((h) => h && (h.includes("telephone") || h.includes("tel"))),
      stagiaires: headers.findIndex((h) => h && (h.includes("stagiaire") || h.includes("etudiant"))),
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const company: Company = {
        id: `company_${year}_${i}`,
        nom: row[indices.nom] || "",
        secteur: row[indices.secteur] || "",
        annee: year,
        adresse: indices.adresse >= 0 ? row[indices.adresse] : undefined,
        contact: indices.contact >= 0 ? row[indices.contact] : undefined,
        email: indices.email >= 0 ? row[indices.email] : undefined,
        telephone: indices.telephone >= 0 ? row[indices.telephone] : undefined,
        nombreStagiaires: indices.stagiaires >= 0 ? Number.parseInt(row[indices.stagiaires]) || 0 : 0,
      }

      if (company.nom) {
        companies.push(company)
      }
    }

    return companies
  }

  private static parseSupervisors(data: any[][], year: string): Supervisor[] {
    if (data.length < 2) return []

    const headers = (data[0] || []).map((h: any) => (h != null ? String(h).toLowerCase() : ""))
    const supervisors: Supervisor[] = []

    const indices = {
      nom: headers.findIndex((h) => h && h.includes("nom") && !h.includes("prenom")),
      prenom: headers.findIndex((h) => h && h.includes("prenom")),
      specialisation: headers.findIndex((h) => h && (h.includes("specialisation") || h.includes("domaine"))),
      email: headers.findIndex((h) => h && (h.includes("email") || h.includes("mail"))),
      telephone: headers.findIndex((h) => h && (h.includes("telephone") || h.includes("tel"))),
      etudiants: headers.findIndex((h) => h && (h.includes("etudiant") || h.includes("nombre"))),
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const supervisor: Supervisor = {
        id: `supervisor_${year}_${i}`,
        nom: row[indices.nom] || "",
        prenom: row[indices.prenom] || "",
        specialisation: row[indices.specialisation] || "",
        annee: year,
        email: indices.email >= 0 ? row[indices.email] : undefined,
        telephone: indices.telephone >= 0 ? row[indices.telephone] : undefined,
        nombreEtudiants: indices.etudiants >= 0 ? Number.parseInt(row[indices.etudiants]) || 0 : 0,
      }

      if (supervisor.nom || supervisor.prenom) {
        supervisors.push(supervisor)
      }
    }

    return supervisors
  }

  static parseExcelData(rawExcelData: any): ParsedExcelData {
    const students: Student[] = []
    const companies: Company[] = []
    const supervisors: Supervisor[] = []
    const yearsCovered: Set<string> = new Set()

    if (!rawExcelData?.sheets) {
      return {
        students: [],
        companies: [],
        supervisors: [],
        rawData: rawExcelData,
        summary: {
          totalStudents: 0,
          totalCompanies: 0,
          totalSupervisors: 0,
          yearsCovered: [],
        },
      }
    }

    // Process each sheet
    Object.entries(rawExcelData.sheets).forEach(([sheetName, sheetData]: [string, any]) => {
    
      if (!Array.isArray(sheetData) || sheetData.length === 0) return

      // Extract year from sheet name (e.g., "2024", "Etudiants_2023", etc.)
      const yearMatch = sheetName.match(/20\d{2}/)
      const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()
      yearsCovered.add(year)

      // Detect data type from headers with safety checks
      const headers = (sheetData[0] || []).filter((h: null) => h != null)
      // const dataType = this.detectDataType(headers)

      students.push(...this.parseStudents(sheetData, year))
      companies.push(...this.parseCompanies(sheetData, year))
      supervisors.push(...this.parseSupervisors(sheetData, year))

      // switch (dataType) {
      //   case "students":
      //     students.push(...this.parseStudents(sheetData, year))
      //     break
      //   case "companies":
      //     companies.push(...this.parseCompanies(sheetData, year))
      //     break
      //   case "supervisors":
      //     supervisors.push(...this.parseSupervisors(sheetData, year))
      //     break
      //   default:
      //     // Try to parse as students by default if structure matches
      //     if (headers.some((h: any) => h != null && String(h).toLowerCase().includes("nom"))) {
      //       students.push(...this.parseStudents(sheetData, year))
      //     }
      // }
    })

    return {
      students,
      companies,
      supervisors,
      rawData: rawExcelData,
      summary: {
        totalStudents: students.length,
        totalCompanies: companies.length,
        totalSupervisors: supervisors.length,
        yearsCovered: Array.from(yearsCovered).sort().reverse(),
      },
    }
  }

  static searchData(
    parsedData: ParsedExcelData,
    query: string,
    filters: { students: boolean; companies: boolean; supervisors: boolean },
    selectedYear?: string,
  ) {
    const results: any[] = []
    const searchTerm = query.toLowerCase()

    if (filters.students) {
      const filteredStudents = parsedData.students.filter((student) => {
        const matchesYear = !selectedYear || student.annee === selectedYear
        const matchesSearch =
          !query ||
          student.nom.toLowerCase().includes(searchTerm) ||
          student.prenom.toLowerCase().includes(searchTerm) ||
          student.specialisation.toLowerCase().includes(searchTerm) ||
          (student.societe && student.societe.toLowerCase().includes(searchTerm)) ||
          (student.encadreur && student.encadreur.toLowerCase().includes(searchTerm))

        return matchesYear && matchesSearch
      })

      results.push(...filteredStudents.map((s) => ({ ...s, type: "student" })))
    }

    if (filters.companies) {
      const filteredCompanies = parsedData.companies.filter((company) => {
        const matchesYear = !selectedYear || company.annee === selectedYear
        const matchesSearch =
          !query || company.nom.toLowerCase().includes(searchTerm) || company.secteur.toLowerCase().includes(searchTerm)

        return matchesYear && matchesSearch
      })

      results.push(...filteredCompanies.map((c) => ({ ...c, type: "company" })))
    }

    if (filters.supervisors) {
      const filteredSupervisors = parsedData.supervisors.filter((supervisor) => {
        const matchesYear = !selectedYear || supervisor.annee === selectedYear
        const matchesSearch =
          !query ||
          supervisor.nom.toLowerCase().includes(searchTerm) ||
          supervisor.prenom.toLowerCase().includes(searchTerm) ||
          supervisor.specialisation.toLowerCase().includes(searchTerm)

        return matchesYear && matchesSearch
      })

      results.push(...filteredSupervisors.map((s) => ({ ...s, type: "supervisor" })))
    }

    return results
  }
}
