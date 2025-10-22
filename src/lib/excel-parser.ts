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
    deduplication: {
      studentsRemoved: number
      companiesRemoved: number
      supervisorsRemoved: number
    }
  }
}

export class ExcelParser {
  // // Global counters for auto-increment IDs
  // private static companyIdCounter = 1
  // private static supervisorIdCounter = 1

  // // Helper method to generate unique IDs
  // private static generateUniqueId(type: string, identifier: string, year: string): string {
  //   return `${type}_${year}_${identifier.replace(/[^a-zA-Z0-9]/g, '_')}`
  // }

  // // Helper method to check if supervisor exists in company's encadrantPro list
  // private static supervisorExistsInCompany(company: Company, supervisorPrenom: string): boolean {
  //   return company.encadrantPro.some(enc => enc.prenom.toLowerCase() === supervisorPrenom.toLowerCase())
  // }

  // // Helper method to check if student project was already counted for supervisor
  // private static isProjectAlreadyCounted(supervisor: Supervisor, codeProjet: string): boolean {
  //   // We'll track this in a separate field or use the existing logic
  //   // For now, we'll assume each supervisor tracks their projects differently
  //   return false // This will be enhanced based on your specific needs
  // }

  // // Smart deduplication methods based on your requirements
  // private static deduplicateCompanies(companies: Company[]): { companies: Company[], removed: number } {
  //   const seen = new Map<string, Company>()
  //   const unique: Company[] = []
  //   let removed = 0

  //   for (const company of companies) {
  //    const key = company.nom.toLowerCase().trim()
      
  //     if (seen.has(key)) {
  //       removed++
  //       const existing = seen.get(key)!
        
  //       // Merge encadrantPro arrays - only add if not already exists
  //       for (const newEncadrant of company.encadrantPro) {
  //         if (!this.supervisorExistsInCompany(existing, newEncadrant.prenom)) {
  //           existing.encadrantPro.push({
  //             ...newEncadrant,
  //             id: `supervisor_pro_${this.supervisorIdCounter++}`
  //           })
  //         }
  //       }
        
  //       // Merge other data if missing
  //       if (!existing.secteur && company.secteur) existing.secteur = company.secteur
  //       if (!existing.adresse && company.adresse) existing.adresse = company.adresse
  //       if (!existing.contact && company.contact) existing.contact = company.contact
  //       if (!existing.email && company.email) existing.email = company.email
  //       if (!existing.telephone && company.telephone) existing.telephone = company.telephone
  //       company.nombreStagiaires = 0
        
  //     } else {
  //       // Assign auto-increment ID
  //       company.id = `company_${this.companyIdCounter++}`
  //       seen.set(key, company)
  //       unique.push(company)
  //     }
  //   }

  //   return { companies: unique, removed }
  // }

  // private static deduplicateSupervisors(supervisors: Supervisor[], students: Student[]): { supervisors: Supervisor[] ,removed: number }
  // {
  //   const seen = new Map<string, Supervisor>()
  //   const unique: Supervisor[] = []
  //   let removed = 0

  //   // Phase 1: Collecter les superviseurs uniques
  //   for (const supervisor of supervisors) {
  //     if (!supervisor.prenom || supervisor.prenom.trim() === '') continue

  //     // Clé unique: prenom + categorie (sans année)
  //     const normalizedPrenom = supervisor.prenom.toLowerCase().trim().replace(/\s+/g, ' ')
  //     const key = `${normalizedPrenom}_${supervisor.categorie}`
      
  //     if (seen.has(key)) {
  //       removed++
  //       const existing = seen.get(key)!
        
  //       // Enrichir les données manquantes
  //       if (!existing.email && supervisor.email) existing.email = supervisor.email
  //       if (!existing.telephone && supervisor.telephone) existing.telephone = supervisor.telephone
  //     } else {
  //       // Nouveau superviseur
  //       const idCounter = supervisor.categorie === 'academique' 
  //         ? this.supervisorAcademiqueIdCounter++ 
  //         : this.supervisorProfessionnelIdCounter++
        
  //       supervisor.id = `supervisor_${supervisor.categorie}_${idCounter}`
  //       supervisor.nombreEtudiants = 0 // Reset, sera calculé plus tard
  //       supervisor.prenom = normalizedPrenom
        
  //       seen.set(key, supervisor)
  //       unique.push(supervisor)
  //     }
  //   }

  //   // Phase 2: Compter les étudiants par codeProjet unique
  //   this.countStudentsForSupervisors(unique, students)

  //   return { supervisors: unique, removed }
  // }

   // Global counters for auto-increment IDs
  private static companyIdCounter = 1
  private static supervisorAcademiqueIdCounter = 1
  private static supervisorProfessionnelIdCounter = 1

  /**
   * CORRECTION 1: Déduplication des sociétés
   * Critère: nom uniquement (pas d'année)
   * Fusionne les encadrants sans doublons
   */
  private static deduplicateCompanies(companies: Company[]): { 
    companies: Company[]
    removed: number 
  } {
    const seen = new Map<string, Company>()
    const unique: Company[] = []
    let removed = 0

    for (const company of companies) {
      if (!company.nom || company.nom.trim() === '') continue

      // Clé unique: nom normalisé (sans année)
      const normalizedNom = company.nom.toLowerCase().trim().replace(/\s+/g, ' ')
      
      if (seen.has(normalizedNom)) {
        removed++
        const existing = seen.get(normalizedNom)!
        
        // Fusionner les encadrants professionnels (éviter doublons)
        for (const newEncadrant of company.encadrantPro) {
          if (!newEncadrant.prenom || newEncadrant.prenom.trim() === '') continue
          
          const normalizedPrenom = newEncadrant.prenom.toLowerCase().trim()
          const encadrantExists = existing.encadrantPro.some(
            enc => enc.prenom.toLowerCase().trim() === normalizedPrenom
          )
          
          if (!encadrantExists) {
            existing.encadrantPro.push({
              ...newEncadrant,
              id: `supervisor_pro_${this.supervisorProfessionnelIdCounter++}`
            })
          }
        }
        
        // Enrichir les données manquantes (ne pas écraser)
        if (!existing.secteur && company.secteur) existing.secteur = company.secteur
        if (!existing.adresse && company.adresse) existing.adresse = company.adresse
        if (!existing.contact && company.contact) existing.contact = company.contact
        if (!existing.email && company.email) existing.email = company.email
        if (!existing.telephone && company.telephone) existing.telephone = company.telephone
        
        // NE PAS additionner nombreStagiaires ici (sera calculé plus tard)
      } else {
        // Nouvelle société
        company.id = `company_${this.companyIdCounter++}`
        company.nombreStagiaires = 0 // Reset, sera calculé plus tard
        
        // Assigner IDs aux encadrants
        company.encadrantPro = company.encadrantPro.map(enc => ({
          ...enc,
          id: `supervisor_pro_${this.supervisorProfessionnelIdCounter++}`,
          nombreEtudiants: 0 // Reset, sera calculé plus tard
        }))
        
        seen.set(normalizedNom, company)
        unique.push(company)
      }
    }

    return { companies: unique, removed }
  }

  /**
   * CORRECTION 2: Déduplication des superviseurs
   * Critère: prenom + categorie uniquement (pas d'année)
   * Compte les étudiants par codeProjet unique
   */
  private static deduplicateSupervisors(
    supervisors: Supervisor[], 
    students: Student[]
  ): { 
    supervisors: Supervisor[]
    removed: number 
  } {
    const seen = new Map<string, Supervisor>()
    const unique: Supervisor[] = []
    let removed = 0

    // Phase 1: Collecter les superviseurs uniques
    for (const supervisor of supervisors) {
      if (!supervisor.prenom || supervisor.prenom.trim() === '') continue

      // Clé unique: prenom + categorie (sans année)
      const normalizedPrenom = supervisor.prenom.toLowerCase().trim().replace(/\s+/g, ' ')
      const key = `${normalizedPrenom}_${supervisor.categorie}`
      
      if (seen.has(key)) {
        removed++
        const existing = seen.get(key)!
        
        // Enrichir les données manquantes
        if (!existing.email && supervisor.email) existing.email = supervisor.email
        if (!existing.telephone && supervisor.telephone) existing.telephone = supervisor.telephone
      } else {
        // Nouveau superviseur
        const idCounter = supervisor.categorie === 'academique' 
          ? this.supervisorAcademiqueIdCounter++ 
          : this.supervisorProfessionnelIdCounter++
        
        supervisor.id = `supervisor_${supervisor.categorie}_${idCounter}`
        supervisor.nombreEtudiants = 0 // Reset, sera calculé plus tard
        supervisor.prenom = normalizedPrenom
        
        seen.set(key, supervisor)
        unique.push(supervisor)
      }
    }

    // Phase 2: Compter les étudiants par codeProjet unique
    this.countStudentsForSupervisors(unique, students)

    return { supervisors: unique, removed }
  }

  /**
   * CORRECTION 3: Compter les étudiants correctement
   * Un même codeProjet ne doit être compté qu'une seule fois par superviseur
   */
  private static countStudentsForSupervisors(
    supervisors: Supervisor[],
    students: Student[]
  ): void {
    // Map: supervisorId -> Set<codeProjet>
    const projectsBySupervisor = new Map<string, Set<string>>()

    for (const student of students) {
      if (!student.codeProjet || student.codeProjet.trim() === '') continue

      // Compter pour encadrant académique
      if (student.encadreurAcId && student.encadreurAcId.trim() !== '') {
        const normalizedName = student.encadreurAcId.toLowerCase().trim().replace(/\s+/g, ' ')
        const academicSupervisor = supervisors.find(s => 
          s.categorie === 'academique' && 
          s.prenom.toLowerCase() === normalizedName
        )
        
        if (academicSupervisor) {
          if (!projectsBySupervisor.has(academicSupervisor.id)) {
            projectsBySupervisor.set(academicSupervisor.id, new Set())
          }
          
          const projects = projectsBySupervisor.get(academicSupervisor.id)!
          if (!projects.has(student.codeProjet)) {
            projects.add(student.codeProjet)
            academicSupervisor.nombreEtudiants++
          }
        }
      }
      
      // Compter pour encadrant professionnel
      if (student.encadreurProId && student.encadreurProId.trim() !== '') {
        const normalizedName = student.encadreurProId.toLowerCase().trim().replace(/\s+/g, ' ')
        const professionalSupervisor = supervisors.find(s => 
          s.categorie === 'professionnel' && 
          s.prenom.toLowerCase() === normalizedName
        )
        
        if (professionalSupervisor) {
          if (!projectsBySupervisor.has(professionalSupervisor.id)) {
            projectsBySupervisor.set(professionalSupervisor.id, new Set())
          }
          
          const projects = projectsBySupervisor.get(professionalSupervisor.id)!
          if (!projects.has(student.codeProjet)) {
            projects.add(student.codeProjet)
            professionalSupervisor.nombreEtudiants++
          }
        }
      }
    }
  }

  /**
   * CORRECTION 4: Compter les stagiaires par société
   * Basé sur les étudiants qui ont cette société
   */
  private static countInternsBySociety(
    companies: Company[],
    students: Student[]
  ): void {
    for (const company of companies) {
      const normalizedNom = company.nom.toLowerCase().trim().replace(/\s+/g, ' ')
      
      company.nombreStagiaires = students.filter(student => {
        if (!student.companyId) return false
        const studentCompany = student.companyId.toLowerCase().trim().replace(/\s+/g, ' ')
        return studentCompany === normalizedNom
      }).length
    }
  }

  /**
   * CORRECTION 5: Déduplication des étudiants
   * Critère: CIN unique
   */
  private static deduplicateStudents(students: Student[]): {
    students: Student[]
    removed: number
  } {
    const seen = new Map<string, Student>()
    const unique: Student[] = []
    let removed = 0

    for (const student of students) {
      if (!student.cin || student.cin.toString().trim() === '') continue

      const normalizedCIN = student.cin.toString().trim()
      
      if (seen.has(normalizedCIN)) {
        removed++
        // Garder celui avec le plus de données
        const existing = seen.get(normalizedCIN)!
        const currentScore = this.calculateCompletenessScore(student)
        const existingScore = this.calculateCompletenessScore(existing)
        
        if (currentScore > existingScore) {
          seen.set(normalizedCIN, student)
          const index = unique.findIndex(s => String(s.cin) === normalizedCIN)
          if (index !== -1) {
            unique[index] = student
          }
        }
      } else {
        student.cin = Number(normalizedCIN)
        seen.set(normalizedCIN, student)
        unique.push(student)
      }
    }

    return { students: unique, removed }
  }

  /**
   * Calcule le score de complétude d'un étudiant
   */
  private static calculateCompletenessScore(student: Student): number {
    let score = 0
    const fields = [
      'email', 'telephone', 'titreProjet', 'score', 'companyId',
      'encadreurAcId', 'encadreurProId', 'debutStage', 'finStage',
      'ficheInformation', 'cahierCharge'
    ]
    
    fields.forEach(field => {
      if ((student as any)[field]) score++
    })
    
    return score
  }


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
    console.log("Parsing headers:", headers)
    // Find column indices with safe string operations
    const indices = {
      codeProject: headers.findIndex((h) => h && (h.includes("code projet") || h.includes("code"))),
      cin: headers.findIndex((h) => h && h.includes("cin")),
      prenom: headers.findIndex((h) => h && h.includes("prenom")),
      filiere: headers.findIndex((h) => h && (h.includes("filiére") || h.includes("specialisation") || h.includes("filiére"))),
      email: headers.findIndex((h) => h && (h.includes("email") || h.includes("mail"))),
      telephone: headers.findIndex((h) => h && (h.includes("téléphone") || h.includes("phone number") )),
      titreProjet: headers.findIndex((h) => h && (h.includes("titre du sujet") || h.includes("projet") || h.includes("sujet"))),
      score: headers.findIndex((h) => h && (h.includes("score") || h.includes("note"))),
      companyId: headers.findIndex((h) => h && (h.includes("société") || h.includes("entreprise") || h.includes("company"))),
      localisationType: headers.findIndex((h) => h && (h.includes("type")  || h.includes("interne/externe"))),
      encadreurAc: headers.findIndex((h) => h && (h.includes("encadrant isimm") || h.includes("academic supervisor") || h.includes("professeur"))),
      encadreurPro: headers.findIndex((h) => h && (h.includes("encadrant professionnel") || h.includes("professional supervisor"))),
      dureeStage: headers.findIndex((h) => h && (h.includes("durée stage") || h.includes("duree") || h.includes("duration"))),
      debutStage: headers.findIndex((h) => h && (h.includes("début stage") || h.includes("debut") || h.includes("start"))),
      finStage: headers.findIndex((h) => h && (h.includes("fin stage") || h.includes("end"))),
      collaboration: headers.findIndex((h) => h && ( h.includes("group type"))),
      collaborateur: headers.findIndex((h) => h && (h.includes("collaborateur") || h.includes("deuxième étudiant"))),
      ficheInformation: headers.findIndex((h) => h && (h.includes("fiche") || h.includes("fiche d'informations scannée"))),
      cahierCharge: headers.findIndex((h) => h && (h.includes("cahier charges") || h.includes("charge"))),
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      // Parse dates safely
      const parseDate = (dateValue: any): Date | undefined => {
        if (!dateValue) return undefined
        const date = new Date(dateValue)
        return isNaN(date.getTime()) ? undefined : date
      }

      const student: Student = {
        codeProjet: indices.codeProject >= 0 ? String(row[indices.codeProject] || "") : "",
        cin: indices.cin >= 0 ? Number(row[indices.cin]) || 0 : 0,
        prenom: indices.prenom >= 0 ? String(row[indices.prenom] || "") : "",
        filiere: indices.filiere >= 0 ? String(row[indices.filiere] || "") : "",
        annee: year,
        email: indices.email >= 0 ? String(row[indices.email] || "") : undefined,
        telephone: indices.telephone >= 0 ? String(row[indices.telephone] || "") : undefined,
        titreProjet: indices.titreProjet >= 0 ? String(row[indices.titreProjet] || "") : undefined,
        score: indices.score >= 0 ? Number(row[indices.score]) || undefined : undefined,
        companyId: indices.companyId >= 0 ? String(row[indices.companyId] || "") : undefined,
        localisation_type: indices.localisationType >= 0 ? 
          (String(row[indices.localisationType] || "").toLowerCase().includes("interne") ? "interne" : "externe") : undefined,
        encadreurAcId: indices.encadreurAc >= 0 ? String(row[indices.encadreurAc] || "") : undefined,
        encadreurProId: indices.encadreurPro >= 0 ? String(row[indices.encadreurPro] || "") : undefined,
        dureeStage: indices.dureeStage >= 0 ? String(row[indices.dureeStage] || "") : undefined,
        debutStage: indices.debutStage >= 0 ? parseDate(row[indices.debutStage]) :new Date(),
        finStage: indices.finStage >= 0 ? parseDate(row[indices.finStage]) : new Date(),
        collaboration: indices.collaboration >= 0 ? 
          (String(row[indices.collaboration] || "").toLowerCase().includes("binôme") ? "binome" : "monome") : "monome",
        collaborateur: indices.collaborateur >= 0 ? 
          { codeProjet: "", cin: 0, prenom: String(row[indices.collaborateur] || ""), filiere: "", annee: year, collaboration: "binome" as const } : undefined,
        ficheInformation: indices.ficheInformation >= 0 ? String(row[indices.ficheInformation] || "") : undefined,
        cahierCharge: indices.cahierCharge >= 0 ? String(row[indices.cahierCharge] || "") : undefined,
      }

      if (student.prenom || student.codeProjet) {
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
      nom: headers.findIndex((h) => h && ( h.includes("société") )),
      secteur: headers.findIndex((h) => h && (h.includes("domaine d'activités") || h.includes("secteur") || h.includes("sector"))),
      adresse: headers.findIndex((h) => h && (h.includes("adresse de société") || h.includes("address"))),
      contact: headers.findIndex((h) => h && h.includes("e-mail encadrant professionnel") || h.includes("contact")),
      email: headers.findIndex((h) => h && (h.includes("email") || h.includes("mail"))),
      telephone: headers.findIndex((h) => h && (h.includes("phone number encadrant professionnel") || h.includes("telephone") || h.includes("phone"))),
      encadrantPro: headers.findIndex((h) => h && (h.includes("encadrant professionnel") || h.includes("professional supervisor"))),
      stagiaires: headers.findIndex((h) => h && (h.includes("nombre de stagiaires") || h.includes("number of interns"))),
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const company: Company = {
        id: `temp_company_${year}_${i}`, // Will be assigned proper ID during deduplication
        nom: indices.nom >= 0 ? String(row[indices.nom] || "") : "",
        secteur: indices.secteur >= 0 ? String(row[indices.secteur] || "") : "",
        annee: year,
        encadrantPro: indices.encadrantPro >= 0 ? [
          {
            id: `supervisor_pro_${year}_${i}`,
            prenom: String(row[indices.encadrantPro] || ""),
            annee: year,
            nombreEtudiants: 1,
            categorie: "professionnel" as const
          }
        ] : [],
        adresse: indices.adresse >= 0 ? String(row[indices.adresse] || "") : undefined,
        contact: indices.contact >= 0 ? String(row[indices.contact] || "") : undefined,
        email: indices.email >= 0 ? String(row[indices.email] || "") : undefined,
        telephone: indices.telephone >= 0 ? String(row[indices.telephone] || "") : undefined,
        nombreStagiaires: indices.stagiaires >= 0 ? Number(row[indices.stagiaires]) || 0 : 0,
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
      prenom: headers.findIndex((h) => h && (h.includes("encadrant professionnel") || h.includes("encadrant isimm"))),
      email: headers.findIndex((h) => h && (h.includes("email *") || h.includes("mail *"))),
      telephone: headers.findIndex((h) => h && (h.includes("phone number *") || h.includes("telephone") || h.includes("tel") )),
      etudiants: headers.findIndex((h) => h && (h.includes("etudiant") || h.includes("nombre") || h.includes("student"))),
      categorie: headers.findIndex((h) => h && (h.includes("categorie") || h.includes("type") || h.includes("academic") || h.includes("professional"))),
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      // Determine category based on column headers or content
      let categorie: "professionnel" | "academique" = "academique"
      if (indices.categorie >= 0) {
        const categorieValue = String(row[indices.categorie] || "").toLowerCase()
        console.log("Categorie value:", categorieValue)
        if (categorieValue.includes("professionnel") || categorieValue.includes("professional")) {
          categorie = "professionnel"
        }
      } else {
        // Try to detect from column headers context
        const headerContext = headers.join(" ")
        console.log("Header context for categorie detection:", headerContext)
        if (headerContext.includes("isimm") || headerContext.includes("academic")) {
          categorie = "academique"
        }
      }

      const supervisor: Supervisor = {
        id: `temp_supervisor_${categorie}_${year}_${i}`, // Will be assigned proper ID during deduplication
        prenom: indices.prenom >= 0 ? String(row[indices.prenom] || "") : "",
        annee: year,
        email: indices.email >= 0 ? String(row[indices.email] || "") : undefined,
        telephone: indices.telephone >= 0 ? String(row[indices.telephone] || "") : undefined,
        nombreEtudiants: indices.etudiants >= 0 ? Number(row[indices.etudiants]) || 0 : 0,
        categorie: categorie,
      }

      if (supervisor.prenom) {
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
          totalSupervisors: {
            academiques: 0,
            professionnels: 0,
            total: 0
          },
          yearsCovered: [],
          collaborations: {
            binomes: 0,
            monomes: 0
          },
          localisations: {
            internes: 0,
            externes: 0
          },
          deduplication: {
            studentsRemoved: 0,
            companiesRemoved: 0,
            supervisorsRemoved: 0
          }
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

    // Apply smart deduplication
    const deduplicatedCompanies = this.deduplicateCompanies(companies)
    const deduplicatedSupervisors = this.deduplicateSupervisors(supervisors, students)
    
    // Calculate detailed summary statistics
    const academiques = deduplicatedSupervisors.supervisors.filter(s => s.categorie === "academique")
    const professionnels = deduplicatedSupervisors.supervisors.filter(s => s.categorie === "professionnel")
    const binomes = students.filter(s => s.collaboration === "binome")
    const monomes = students.filter(s => s.collaboration === "monome")
    const internes = students.filter(s => s.localisation_type === "interne")
    const externes = students.filter(s => s.localisation_type === "externe")

    return {
      students,
      companies: deduplicatedCompanies.companies,
      supervisors: deduplicatedSupervisors.supervisors,
      rawData: rawExcelData,
      summary: {
        totalStudents: students.length,
        totalCompanies: deduplicatedCompanies.companies.length,
        totalSupervisors: {
          academiques: academiques.length,
          professionnels: professionnels.length,
          total: deduplicatedSupervisors.supervisors.length
        },
        yearsCovered: Array.from(yearsCovered).sort().reverse(),
        collaborations: {
          binomes: binomes.length,
          monomes: monomes.length
        },
        localisations: {
          internes: internes.length,
          externes: externes.length
        },
        deduplication: {
          studentsRemoved: 0, // Students are not deduplicated in this version
          companiesRemoved: deduplicatedCompanies.removed,
          supervisorsRemoved: deduplicatedSupervisors.removed
        }
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
          student.prenom.toLowerCase().includes(searchTerm) ||
          student.filiere.toLowerCase().includes(searchTerm) ||
          (student.companyId && student.companyId.toLowerCase().includes(searchTerm)) ||
          (student.encadreurAcId && student.encadreurAcId.toLowerCase().includes(searchTerm)) ||
          (student.encadreurProId && student.encadreurProId.toLowerCase().includes(searchTerm))

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
          supervisor.prenom.toLowerCase().includes(searchTerm) ||
          supervisor.categorie.toLowerCase().includes(searchTerm)

        return matchesYear && matchesSearch
      })

      results.push(...filteredSupervisors.map((s) => ({ ...s, type: "supervisor" })))
    }

    return results
  }
}
