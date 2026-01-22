import {type ParsedExcelData } from "@/lib/excel-parser"
import { SupervisorDTO } from "@/dto/supervisor.dto"
import { StudentDTO } from "@/dto/student.dto"
import { CompanyDTO } from "@/dto/company.dto"

export const saveToDatabase = async (parsedData: ParsedExcelData) => {
    const results = {
      students: { inserted: 0, failed: 0, total: 0 },
      companies: { inserted: 0, failed: 0, total: 0 },
      supervisors: { inserted: 0, failed: 0, total: 0 },
    };

    try {
      // Save students
      if (parsedData.students.length > 0) {
        const response = await fetch("/api/student/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: parsedData.students }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erreur lors de l'insertion des étudiants");
        }

        const result = await response.json();
        results.students = result.data;
      }

      // Save companies
      if (parsedData.companies.length > 0) {
        const response = await fetch("/api/company/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companies: parsedData.companies }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Erreur entreprises:", error);
        } else {
          const result = await response.json();
          results.companies = result.data;
        }
      }

      // Save supervisors
      if (parsedData.supervisors.length > 0) {
        const response = await fetch("/api/supervisor/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supervisors: parsedData.supervisors }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Erreur superviseurs:", error);

        } else {
          const result = await response.json();
          results.supervisors = result.data;
        }
      }
      
      // Check if any insertions failed completely
      const totalExpected = parsedData.students.length + parsedData.companies.length + parsedData.supervisors.length;
      const totalInserted = results.students.inserted + results.companies.inserted + results.supervisors.inserted;

      if (totalInserted === 0 && totalExpected > 0) {
        throw new Error("Aucune donnée n'a pu être enregistrée");
      }

      return results;

    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      throw error;
    }
  }

  
export const getFromDatabase = async (year: String) => {
    try {
      const studentsRes = await fetch("/api/student/batch?year=" + year, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      const supervisorsRes= await fetch("/api/supervisor/batch", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }); 
      
      const companiesRes = await fetch("/api/company/batch?year=" + year, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!studentsRes.ok || !supervisorsRes.ok || !companiesRes.ok) {
        throw new Error("Erreur lors de la récupération des données")
      }

      const studentsData = await studentsRes.json()
      const supervisorsData = await supervisorsRes.json()
      const companiesData = await companiesRes.json()
      console.log("Données récupérées:", { studentsData, supervisorsData, companiesData })

      const yearsSet = new Set<string>()
      studentsData.data.forEach((s: StudentDTO) => yearsSet.add(s.annee))
      companiesData.data.forEach((c: CompanyDTO) => yearsSet.add(c.annee))
      supervisorsData.data.forEach((s: SupervisorDTO) => yearsSet.add(s.annee))
      
      return {
        students: studentsData.data as StudentDTO[],
        companies: companiesData.data as CompanyDTO[],
        supervisors: supervisorsData.data as SupervisorDTO[],
        summary: {
          totalStudents: studentsData.data.length,
          totalCompanies: companiesData.data.length,
          totalSupervisors: supervisorsData.data.length,
          yearsCovered: Array.from(yearsSet).sort().reverse(),
        },
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error)
      throw error
    }
  }