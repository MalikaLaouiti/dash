"use server";
import { NextRequest, NextResponse } from 'next/server';
import Company from '@/models/Company';
import { connectDB } from '@/lib/mongodb';
import { CompanyDTO } from '@/dto/company.dto';
import { serializeMongoDoc } from '@/lib/serializers';

export async function getCompanies():Promise<CompanyDTO[]> {
    try {
        await connectDB();
        const companies = await Company.find();
        return serializeMongoDoc(companies);
    }
    catch (error) {
        console.error('Failed to fetch companies:', error);
        throw error;
    }
}
export async function createCompany(companyData: any):Promise<CompanyDTO> {
    try {
        await connectDB();
        const company = await Company.create(companyData);
        return serializeMongoDoc(company);
    }
    catch (error) {
        console.error('Failed to create company:', error);
        throw error;
    }
}

export async function createCompaniesBatch(companiesData: any[]):Promise<CompanyDTO[]> {
    try {
        await connectDB();
        const companies = await Company.insertMany(companiesData, { ordered: false });
        return serializeMongoDoc(companies);
    }   
    catch (error) {
        console.error('Failed to create companies batch:', error);
        throw error;
    }
}




