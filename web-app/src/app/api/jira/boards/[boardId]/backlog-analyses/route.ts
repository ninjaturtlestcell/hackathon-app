import { NextRequest, NextResponse } from "next/server";

import { saveBacklogAnalysis, getBacklogAnalysesByBoard } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.estimations) || body.estimations.length === 0) {
    return NextResponse.json(
      { error: "estimations dizisi gerekli" },
      { status: 400 },
    );
  }

  const id = saveBacklogAnalysis(boardId, body.estimations as unknown[]);
  return NextResponse.json({ id, boardId, taskCount: (body.estimations as unknown[]).length });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  const analyses = getBacklogAnalysesByBoard(boardId);
  return NextResponse.json({ boardId, analyses });
}
