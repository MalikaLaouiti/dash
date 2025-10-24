"use server";
import { NextRequest, NextResponse } from 'next/server';
import Company from '@/models/Company';
import { connectDB } from '@/lib/mongodb';

export async function getCompanies(){
    try {
        await connectDB();
        const companies = await Company.find();
        return companies;
    }
    catch (error) {
        console.error('Failed to fetch companies:', error);
        throw error;
    }
}

export async function createCompaniesBatch(companiesData: any[]) {
    try {
        await connectDB();
        const companies = await Company.insertMany(companiesData, { ordered: false });
        return companies;
    }   
    catch (error) {
        console.error('Failed to create companies batch:', error);
        throw error;
    }
}




