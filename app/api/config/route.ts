import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    mockMode: isMockMode(),
  });
}
