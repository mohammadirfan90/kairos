import { NextResponse } from "next/server";
import {
  getProjectResults,
  updateProjectResult,
  bulkUpdateProjectResults,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const results = await getProjectResults(id);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Failed to fetch project results:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const currentUser = await getCurrentUser();

    const actorName = currentUser ? `${currentUser.name} (${currentUser.role})` : body.actor || body.testerName || "QA Tester";
    const testerName = currentUser ? currentUser.name : body.testerName || "QA Tester";
    const testerId = currentUser ? currentUser.id : undefined;

    // Check if bulk update
    if (Array.isArray(body.updates)) {
      await bulkUpdateProjectResults(id, body.updates, actorName, testerId);
      const updatedResults = await getProjectResults(id);
      return NextResponse.json({ success: true, data: updatedResults });
    }

    if (!body.itemId) {
      return NextResponse.json(
        { success: false, error: "itemId is required" },
        { status: 400 }
      );
    }

    const updated = await updateProjectResult(
      id,
      body.itemId,
      {
        status: body.status,
        testerName,
        testerId,
        notes: body.notes,
        expectedBehavior: body.expectedBehavior,
        actualBehavior: body.actualBehavior,
        stepsToReproduce: body.stepsToReproduce,
        evidenceUrl: body.evidenceUrl,
      },
      actorName,
      testerId
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update checklist result:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
