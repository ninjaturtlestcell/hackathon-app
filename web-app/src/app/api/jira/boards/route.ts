import { NextResponse } from "next/server";

import { getAllBoards } from "@shared/jira";
import { getJiraSession } from "@/lib/jira/session";

const BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

export async function GET() {
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_JIRA_BASE_URL yapılandırılmamış" },
      { status: 500 },
    );
  }

  const session = await getJiraSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const decoded = Buffer.from(session.credentials, "base64").toString();
  const colonIdx = decoded.indexOf(":");
  const username = decoded.slice(0, colonIdx);
  const password = decoded.slice(colonIdx + 1);

  try {
    const boards = await getAllBoards({ baseUrl: BASE_URL, username, password });
    return NextResponse.json({ boards });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Board'lar alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
