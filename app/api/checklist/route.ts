import { NextResponse } from "next/server";
import { getCategories, getChecklistItems } from "@/lib/db";

export async function GET() {
  try {
    const [categories, items] = await Promise.all([
      getCategories(),
      getChecklistItems(),
    ]);
    return NextResponse.json({
      success: true,
      data: { categories, items },
    });
  } catch (error) {
    console.error("Failed to fetch checklist schema:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
