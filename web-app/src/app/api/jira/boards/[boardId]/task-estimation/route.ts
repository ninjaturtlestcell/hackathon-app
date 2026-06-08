import { NextRequest, NextResponse } from "next/server";

import { getIssueDetails, type IssueDetail } from "@shared/jira";
import { getJiraSession } from "@/lib/jira/session";
import { callGeminiJson } from "@/lib/gemini";
import { getAnalysesByBoard, type AnalysisRow } from "@/lib/db";

export const maxDuration = 300;

const BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillSizeInsight = { typical_points: number; description: string };

type SkillDistEntry = {
  size_point_insights?: Record<string, SkillSizeInsight>;
  avg_estimate?: number;
};

type EffortJson = { skill_distribution?: Record<string, SkillDistEntry> };
type UserProfile = { owner: string; primary_skills?: string[]; total_story_points?: number };
type UserJson = { user_profiles?: UserProfile[] };

export type TaskEstimation = {
  task_id: string;
  task_name: string;
  estimated_story_points: number;
  story_point_range: [number, number];
  primary_skill: string;
  detected_skills: Record<string, number>;
  confidence: "low" | "medium" | "high";
  reasoning: string;
  suggested_assignee: string | null;
  assignee_reasoning: string | null;
};

// ─── Historical context builder ───────────────────────────────────────────────

function buildHistoricalContext(analyses: AnalysisRow[]): string {
  if (analyses.length === 0) {
    return "Bu board için henüz geçmiş sprint analizi bulunmuyor. Sadece task içeriğine dayan.";
  }

  // Aggregate skill sizing patterns across all analyses
  const skillMap = new Map<string, { points: number[]; insights: Record<string, SkillSizeInsight> }>();
  // Aggregate team member profiles
  const userMap = new Map<string, { skills: Set<string>; sprintCount: number; totalSP: number }>();

  for (const row of analyses) {
    const effort = row.effortAnalysisJson as EffortJson | null;
    const user = row.userAnalysisJson as UserJson | null;

    if (effort?.skill_distribution) {
      for (const [skill, data] of Object.entries(effort.skill_distribution)) {
        const existing = skillMap.get(skill) ?? { points: [], insights: {} };
        if (data.avg_estimate) existing.points.push(data.avg_estimate);
        for (const [size, insight] of Object.entries(data.size_point_insights ?? {})) {
          if (!existing.insights[size]) existing.insights[size] = insight;
        }
        skillMap.set(skill, existing);
      }
    }

    if (user?.user_profiles) {
      for (const profile of user.user_profiles) {
        const existing = userMap.get(profile.owner) ?? { skills: new Set(), sprintCount: 0, totalSP: 0 };
        existing.sprintCount++;
        existing.totalSP += profile.total_story_points ?? 0;
        for (const s of profile.primary_skills ?? []) existing.skills.add(s);
        userMap.set(profile.owner, existing);
      }
    }
  }

  const lines: string[] = [
    `=== GEÇMİŞ SPRINT ANALİZLERİ (${analyses.length} sprint baz alındı) ===`,
    "",
    "SKILL SIZING PALETİ:",
  ];

  for (const [skill, data] of skillMap.entries()) {
    const sizeParts = Object.entries(data.insights)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([size, insight]) => `${size}→${insight.typical_points}pkt (${insight.description.slice(0, 60)}...)`)
      .join(" | ");
    lines.push(`  ${skill}: ${sizeParts || `ort. ${Math.round(data.points.reduce((s, v) => s + v, 0) / (data.points.length || 1))} SP`}`);
  }

  lines.push("", "TAKIM ÜYELERİ VE SKILL PROFİLLERİ:");
  for (const [owner, data] of userMap.entries()) {
    lines.push(`  ${owner}: ${[...data.skills].join(", ")} (${data.sprintCount} sprint, ${data.totalSP} toplam SP)`);
  }

  return lines.join("\n");
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildEstimationPrompt(historicalCtx: string, tasks: IssueDetail[]): string {
  const taskJson = JSON.stringify(
    tasks.map((t) => ({
      task_id: t.key,
      task_name: t.summary,
      description: t.description ?? "",
      issue_type: t.issueType,
      priority: t.priority,
      labels: t.labels,
    })),
    null,
    2,
  );

  return `Sen bir agile story point tahmin ve görev atama aracısın.

Elinde:
1. Tahmin edilecek yeni task listesi
2. Önceki sprintlerdeki task analiz geçmişi (skill sizing pattern'leri ve takım üyesi profilleri)

---

${historicalCtx}

---

## TAHMİN EDİLECEK TASKLAR:
${taskJson}

---

Her task için şunları üret:
- estimated_story_points: En olası story point değeri (geçmiş pattern'lere göre)
- story_point_range: [min, max] aralığı
- primary_skill: Bu task için birincil skill kategorisi
- detected_skills: Tespit edilen skill'ler ve ağırlıkları (toplamı 1.0)
- confidence: Tahmin güven seviyesi
- reasoning: Story point tahmini gerekçesi (kısa, açıklanabilir)
- suggested_assignee: Önerilen atanacak kişi — SADECE yukarıdaki takım listesinden seç, yoksa null
- assignee_reasoning: Skill uyumuna dayalı atama gerekçesi (kişi performansı yorumu yapma)

Kurallar:
- Geçmiş sprint pattern'leri yoksa task içeriğine göre mantıklı tahmin yap.
- suggested_assignee için SADECE "TAKIM ÜYELERİ" listesindeki kişileri kullan.
- Kişi performansı yorumu yapma, sadece skill uyumuna bak.
- JSON içindeki tüm metin alanlarını (reasoning, assignee_reasoning vb.) TÜRKÇE yaz. İngilizce metin kullanma.
- JSON dışında hiçbir şey yazma.

Çıktı formatı:
{
  "estimations": [
    {
      "task_id": "<string>",
      "task_name": "<string>",
      "estimated_story_points": <int>,
      "story_point_range": [<int>, <int>],
      "primary_skill": "<string>",
      "detected_skills": { "<skill>": <float> },
      "confidence": "low" | "medium" | "high",
      "reasoning": "<string>",
      "suggested_assignee": "<string>" | null,
      "assignee_reasoning": "<string>" | null
    }
  ]
}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_JIRA_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const { boardId } = await params;

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.taskIds) || body.taskIds.length === 0) {
    return NextResponse.json(
      { error: "taskIds dizisi gerekli (örn. [\"PROJ-1\", \"PROJ-2\"])" },
      { status: 400 },
    );
  }
  const taskIds = (body.taskIds as unknown[]).filter((id): id is string => typeof id === "string");
  if (taskIds.length === 0) {
    return NextResponse.json({ error: "Geçerli task ID bulunamadı" }, { status: 400 });
  }

  // Credentials: token body param → session cookie
  let username: string;
  let password: string;

  const tokenParam: unknown = body.token;
  if (typeof tokenParam === "string" && tokenParam) {
    const decoded = Buffer.from(tokenParam, "base64").toString();
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) {
      return NextResponse.json(
        { error: "Geçersiz token formatı. base64(username:password) bekleniyor" },
        { status: 400 },
      );
    }
    username = decoded.slice(0, colonIdx);
    password = decoded.slice(colonIdx + 1);
  } else {
    const session = await getJiraSession();
    if (!session) {
      return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
    }
    const decoded = Buffer.from(session.credentials, "base64").toString();
    const colonIdx = decoded.indexOf(":");
    username = decoded.slice(0, colonIdx);
    password = decoded.slice(colonIdx + 1);
  }

  // 1. Jira'dan task detaylarını çek
  let tasks: IssueDetail[];
  try {
    tasks = await getIssueDetails({ baseUrl: BASE_URL, username, password }, taskIds);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Task detayları alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (tasks.length === 0) {
    return NextResponse.json({ error: "Hiçbir task detayı alınamadı" }, { status: 404 });
  }

  // 2. Board'un geçmiş analizlerini DB'den çek
  const analyses = getAnalysesByBoard(boardId);

  // 3. Gemini'ye gönder
  const historicalCtx = buildHistoricalContext(analyses);
  const prompt = buildEstimationPrompt(historicalCtx, tasks);

  let result: { estimations: TaskEstimation[] };
  try {
    result = await callGeminiJson<{ estimations: TaskEstimation[] }>(prompt);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini tahmini başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    boardId,
    taskCount: tasks.length,
    analysisCount: analyses.length,
    estimations: result.estimations ?? [],
  });
}
