import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(request: NextRequest){
    try {
        await connectDB();
        const years = await Student.distinct('year');
        return NextResponse.json({
            success: true,
            data: years
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
        success: false,
        error: "Failed to fetch years",
        message: error.message
        }, { status: 500 });
    }
}