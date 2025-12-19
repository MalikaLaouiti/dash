import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getTopCompanies } from '../company/route';
import { getGradesByFiliere } from '../student/route';
import { getPopularDomains } from '../student/route';
import { getFiliereDistribution } from '../student/route';
import { getYearlyStats } from '../student/route';
import { getTopSupervisorsByFiliere } from '../supervisor/route';
import { getCompanyPerformance } from '../company/route';
import {getSupervisorWorkload} from "../supervisor/route";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const filiere = searchParams.get('filiere');

    let result;

    switch (type) {
      case 'top-supervisors':
        result = await getTopSupervisorsByFiliere(filiere);
        break;
      
      case 'top-companies':
        result = await getTopCompanies(year);
        break;
      
      case 'popular-domains':
        result = await getPopularDomains();
        break;
      
      case 'grades-by-filiere':
        result = await getGradesByFiliere(filiere, year);
        break;
      
      case 'yearly-stats':
        result = await getYearlyStats();
        break;
      
      case 'filiere-distribution':
        result = await getFiliereDistribution();
        break;
      
      case 'company-performance':
        result = await getCompanyPerformance();
        break;
      
      case 'supervisor-workload':
        result = await getSupervisorWorkload();
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      type,
      filters: { year, filiere }
    });

  } catch (error: any) {
    console.error('Analytics Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: error.message },
      { status: 500 }
    );
  }
}



