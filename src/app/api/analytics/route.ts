// app/api/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import getTopSupervisors from '@/lib/analyse/topSupervisor';
import getCompanyFiliereAnalysis from '@/lib/analyse/companyFiliere';
import getCompanyLoyaltyAnalysis from '@/lib/analyse/companyLoyalty';
import getCompanyCapacityAnalysis from '@/lib/analyse/companyCapacity';
import getYearOverYearComparison from '@/lib/analyse/yearComparison';



export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json({
        success: true,
        message: 'API Analytics Centralisée - Gestion des stages',
        version: '1.0.0',
        // endpoints: getEndpointsList(),
        documentation: '/api-docs'
      });
    }

    switch (action) {
      case 'top-supervisors':
        return await handleTopSupervisors(searchParams);
      
      case 'company-filiere':
        return await handleCompanyFiliere(searchParams);
      
      case 'company-loyalty':
        return await handleCompanyLoyalty(searchParams);
      
      case 'company-capacity':
        return await handleCompanyCapacity(searchParams);
      
      case 'year-comparison':
        return await handleYearComparison(searchParams);
      
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Action '${action}' non valide`,
            validActions: [
              'top-supervisors',
              'company-filiere',
              'company-loyalty',
              'company-capacity',
              'year-comparison'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analytics API Error:', error);
    return handleError(error);
  }
}

async function handleTopSupervisors(searchParams: URLSearchParams) {
  try {
    const year = searchParams.get('year');
    if (!year) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre "year" est requis' },
        { status: 400 }
      );
    }

    const categorieParam = searchParams.get('categorie');
    const categorie = categorieParam 
      ? (categorieParam as 'professionnel' | 'academique') 
      : undefined;

    if (categorieParam && !['professionnel', 'academique'].includes(categorieParam)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le paramètre "categorie" doit être "professionnel" ou "academique"' 
        },
        { status: 400 }
      );
    }

    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 10;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le paramètre "limit" doit être un nombre entre 1 et 100' 
        },
        { status: 400 }
      );
    }

    const results = await getTopSupervisors(year, categorie, limit);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      count: results.length,
      metadata: {
        year,
        categorie: categorie || 'toutes',
        limit
      }
    });
  } catch (error) {
    console.error('Error in top-supervisors:', error);
    throw error;
  }
}

async function handleCompanyFiliere(searchParams: URLSearchParams) {
  try {
    const year = searchParams.get('year');
    if (!year) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre "year" est requis' },
        { status: 400 }
      );
    }

    const minStudentsParam = searchParams.get('minStudents');
    const minStudents = minStudentsParam ? parseInt(minStudentsParam) : 1;

    if (isNaN(minStudents) || minStudents < 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le paramètre "minStudents" doit être un nombre positif' 
        },
        { status: 400 }
      );
    }

    const results = await getCompanyFiliereAnalysis(year);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      count: results.length,
      metadata: {
        year
      }
    });
  } catch (error) {
    console.error('Error in company-filiere:', error);
    throw error;
  }
}

async function handleCompanyLoyalty(searchParams: URLSearchParams) {
  try {
    const yearsParam = searchParams.get('years');
    if (!yearsParam) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre "years" est requis (format: 2022,2023,2024)' },
        { status: 400 }
      );
    }

    const years = yearsParam.split(',').map(y => y.trim());
    
    if (years.length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Minimum 2 années requises pour l\'analyse de fidélité' 
        },
        { status: 400 }
      );
    }

    const yearRegex = /^\d{4}$/;
    const invalidYears = years.filter(y => !yearRegex.test(y));
    if (invalidYears.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Années invalides: ${invalidYears.join(', ')} (format attendu: YYYY)` 
        },
        { status: 400 }
      );
    }

    const minYearsActiveParam = searchParams.get('minYearsActive');
    const minYearsActive = minYearsActiveParam ? parseInt(minYearsActiveParam) : 2;

    const loyaltyThresholdParam = searchParams.get('loyaltyThreshold');
    const loyaltyThreshold = loyaltyThresholdParam ? parseInt(loyaltyThresholdParam) : 2;

    const results = await getCompanyLoyaltyAnalysis(years);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      count: results.length,
      metadata: {
        years,
        minYearsActive,
        loyaltyThreshold
      }
    });
  } catch (error) {
    console.error('Error in company-loyalty:', error);
    throw error;
  }
}

async function handleCompanyCapacity(searchParams: URLSearchParams) {
  try {
    const year = searchParams.get('year');
    if (!year) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre "year" est requis' },
        { status: 400 }
      );
    }

    const results = await getCompanyCapacityAnalysis(year);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      metadata: {
        year,
        totalCompanies: 
          results.stats.totalGrandes + 
          results.stats.totalMoyennes + 
          results.stats.totalPetites
      }
    });
  } catch (error) {
    console.error('Error in company-capacity:', error);
    throw error;
  }
}

async function handleYearComparison(searchParams: URLSearchParams) {
  try {
    const yearsParam = searchParams.get('years');
    if (!yearsParam) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre "years" est requis (format: 2022,2023,2024)' },
        { status: 400 }
      );
    }

    const years = yearsParam.split(',').map(y => y.trim());

    // Valider le format de chaque année
    const yearRegex = /^\d{4}$/;
    const invalidYears = years.filter(y => !yearRegex.test(y));
    if (invalidYears.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Années invalides: ${invalidYears.join(', ')} (format attendu: YYYY)` 
        },
        { status: 400 }
      );
    }

    if (years.length > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Maximum 10 années peuvent être comparées' 
        },
        { status: 400 }
      );
    }

    const results = await getYearOverYearComparison(years);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      metadata: {
        years,
        yearsCount: years.length
      }
    });
  } catch (error) {
    console.error('Error in year-comparison:', error);
    throw error;
  }
}


function handleError(error: unknown) {

  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur de validation',
      },
      { status: 400 }
    );
  }
  
  if (error && typeof error === 'object' && 'name' in error) {
    const err = error as { name: string; message: string };
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur de base de données',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { 
      success: false, 
      error: error instanceof Error 
        ? error.message 
        : 'Erreur interne du serveur',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.stack
        : undefined
    },
    { status: 500 }
  );
}

// ============================================
// DOCUMENTATION DES ENDPOINTS
// ============================================

// function getEndpointsList() {
//   return [
//     {
//       action: 'top-supervisors',
//       method: 'GET',
//       description: 'Encadrants les plus sollicités',
//       params: {
//         year: '(required) Année à analyser (format: YYYY)',
//         categorie: '(optional) "professionnel" ou "academique"',
//         limit: '(optional) Nombre de résultats (défaut: 10, max: 100)'
//       },
//       example: '/api/analytics?action=top-supervisors&year=2024&categorie=academique&limit=10'
//     },
//     {
//       action: 'company-filiere',
//       method: 'GET',
//       description: 'Analyse de la répartition entreprise-filière',
//       params: {
//         year: '(required) Année à analyser (format: YYYY)',
//         minStudents: '(optional) Nombre minimum d\'étudiants (défaut: 1)'
//       },
//       example: '/api/analytics?action=company-filiere&year=2024&minStudents=2'
//     },
//     {
//       action: 'company-loyalty',
//       method: 'GET',
//       description: 'Analyse de la fidélité des entreprises sur plusieurs années',
//       params: {
//         years: '(required) Années séparées par des virgules (ex: 2022,2023,2024)',
//         minYearsActive: '(optional) Années minimum d\'activité (défaut: 2)',
//         loyaltyThreshold: '(optional) Seuil de fidélité en nombre d\'années (défaut: 2)'
//       },
//       example: '/api/analytics?action=company-loyalty&years=2022,2023,2024'
//     },
//     {
//       action: 'company-capacity',
//       method: 'GET',
//       description: 'Analyse de la capacité d\'accueil des entreprises',
//       params: {
//         year: '(required) Année à analyser (format: YYYY)'
//       },
//       example: '/api/analytics?action=company-capacity&year=2024'
//     },
//     {
//       action: 'year-comparison',
//       method: 'GET',
//       description: 'Comparaison des données sur plusieurs années',
//       params: {
//         years: '(required) Années à comparer (ex: 2022,2023,2024, max: 10)'
//       },
//       example: '/api/analytics?action=year-comparison&years=2022,2023,2024'
//     }
//   ];
// }