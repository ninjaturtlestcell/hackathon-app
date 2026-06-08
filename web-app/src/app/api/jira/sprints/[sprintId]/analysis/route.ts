import { NextRequest, NextResponse } from "next/server";

import { getSprintIssues, type SprintWithIssues } from "@shared/jira";
import { getJiraSession } from "@/lib/jira/session";
import { callGeminiJson } from "@/lib/gemini";
import { getCachedSprintIssuesJson, upsertSprintIssuesJson, upsertAnalysis } from "@/lib/db";

export const maxDuration = 300;

const BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

function buildPrompt(
  sprint: { name: string; startDate: string | null; endDate: string | null; completeDate: string | null; goal: string | null },
  tasks: {
    task_id: string;
    task_name: string;
    estimate: number | null;
    owner: string | null;
    status: string;
    status_category: string;
  }[]
): string {
  const taskJson = JSON.stringify(tasks, null, 2);

  return `Sen bir agile sprint analiz aracısın.
Elinde bir sprint içindeki task listesi var. Her task için şu bilgiler verilmiştir:
- task_id
- task_name
- estimate (story points, null ise 0 kabul et)
- owner (assignee, null ise "Unassigned" kabul et)
- status: task'ın güncel durumu
- status_category: "done" = tamamlandı, "in-progress" = devam ediyor, "new" = başlanmadı

Sprint adı: ${sprint.name}
Sprint başlangıç: ${sprint.startDate ?? "—"}
Sprint bitiş: ${sprint.endDate ?? sprint.completeDate ?? "—"}
Sprint hedefi: ${sprint.goal ?? "Belirtilmemiş"}

Task listesi:
${taskJson}

---

Görevin bu sprint verilerini üç farklı açıdan analiz etmek.

## 1. EFFORT ANALİZİ (effortAnalysisJson)

Taskları analiz ederek skill bazlı bir dağılım ve sizing insight üret.
Kesinlikle kişi performansı analizi yapma.
Kesinlikle owner önerisi yapma.
Sadece taskların hangi skill / iş tiplerine ait olduğunu ve bu skill'lerde hangi size / puan kalıplarının oluştuğunu analiz et.

Aşağıdaki skill kategorilerini başlangıç referansı olarak kullan, ama task içeriğine göre yeni kategoriler de üretebilirsin:
frontend, backend, kafka, database, integration, new_view_development, bug_fix, configuration, testing, reporting, authorization, batch_job, api_development, ui_update, data_mapping

Skill çıkarımı yaparken teknik kelimelere değil, taskın iş anlamına da bak:
- "Yeni ekran", "yeni view", "sayfa oluşturma" → new_view_development veya frontend
- "API", "endpoint", "service", "controller" → backend veya api_development
- "Kafka", "consumer", "producer", "topic", "event" → kafka
- "Entegrasyon", "external service", "third party", "SOAP" → integration
- "Tablo", "query", "SQL", "migration", "DB kayıt" → database
- "Yetki", "rol", "permission" → authorization
- "Rapor", "export", "Excel", "dashboard" → reporting
- "Test", "kontrol", "otomasyon" → testing

Bir task birden fazla skill içerebilir; bu durumda ağırlıkları toplamı 1.0 olacak şekilde dağıt.

effortAnalysisJson formatı:
{
  "skill_distribution": {
    "<skill_name>": {
      "task_count": <int>,
      "avg_estimate": <float>,
      "median_estimate": <float>,
      "min_estimate": <float>,
      "max_estimate": <float>,
      "common_keywords": [<string>],
      "common_patterns": [<string>],
      "size_point_insights": {
        "S": { "typical_points": <int>, "point_range": [<int>, <int>], "task_count": <int>, "description": <string>, "reference_task_ids": [<string>] },
        "M": { "typical_points": <int>, "point_range": [<int>, <int>], "task_count": <int>, "description": <string>, "reference_task_ids": [<string>] },
        "L": { "typical_points": <int>, "point_range": [<int>, <int>], "task_count": <int>, "description": <string>, "reference_task_ids": [<string>] }
      },
      "confidence": "low" | "medium" | "high"
    }
  },
  "task_skill_mapping": [
    {
      "task_id": <string>,
      "task_name": <string>,
      "estimate": <int>,
      "detected_skills": { "<skill>": <float> },
      "assigned_primary_skill": <string>,
      "assigned_size": "S" | "M" | "L" | "XL",
      "reason": <string>
    }
  ],
  "global_skill_insights": [<string>]
}

Kurallar:
- Estimate değerlerini değiştirme, sadece analiz et.
- Task açıklaması belirsizse "unknown" veya "analysis_needed" skill'i kullan.
- 1 task → confidence: "low", 2-4 task → "medium", 5+ → "high".
- Size point insight üretirken mutlaka reference_task_ids ver.
- common_keywords alanında sadece tasklarda gerçekten geçen kelimeleri kullan.

---

## 2. KULLANICI ANALİZİ (userAnalysisJson)

Her takım üyesi için hangi tip taskları aldığını analiz et.
Kesinlikle performans yorumu yapma, kişiler hakkında değerlendirme yapma.
Sadece hangi kişinin hangi skill/konu tipi işler yaptığını göster.

userAnalysisJson formatı:
{
  "user_profiles": [
    {
      "owner": <string>,
      "task_count": <int>,
      "total_story_points": <int>,
      "primary_skills": [<string>],
      "skill_distribution": { "<skill>": <float (0-1, toplamı 1.0)> },
      "tasks": [
        { "task_id": <string>, "task_name": <string>, "estimate": <int>, "skills": [<string>] }
      ]
    }
  ]
}

---

## 3. SPRINT EXECUTİVE ANALİZİ (sprintAnalysisJson)

Sprint'i bir bütün olarak değerlendir. status_category alanını kullanarak tamamlanma oranını hesapla.
Kişisel performans yorumu yapma; süreç ve takım dinamiğine odaklan.

sprintAnalysisJson formatı:
{
  "summary": <string — sprint'in 2-3 cümlelik genel özeti>,
  "overall_sentiment": "positive" | "neutral" | "negative",
  "sprint_health_score": <int 1-100 — aşağıdaki faktörlerin ağırlıklı ortalaması:
    • Tamamlanma oranı (task sayısı bazlı) → ağırlık %35
    • SP tamamlanma oranı (story point bazlı) → ağırlık %30
    • İş kalitesi / süreç sinyalleri (eksik task sayısı, belirsiz tahminler, tekrarlayan bug vb.) → ağırlık %20
    • Sprint hedefine ulaşma (goal varsa değerlendir, yoksa nötr) → ağırlık %15
    Skor yorumu: 80-100 = Mükemmel, 60-79 = İyi, 40-59 = Orta, 20-39 = Zayıf, 1-19 = Kritik>,
  "health_score_breakdown": {
    "completion_task": <int 0-100 — task tamamlanma oranına göre alt skor>,
    "completion_sp": <int 0-100 — SP tamamlanma oranına göre alt skor>,
    "quality_process": <int 0-100 — kalite/süreç sinyallerine göre alt skor>,
    "goal_achievement": <int 0-100 — sprint hedefine ulaşmaya göre alt skor>
  },
  "completion_rate": <float 0-1 — status_category==="done" olan task sayısı / toplam task sayısı>,
  "completed_story_points": <int>,
  "total_story_points": <int>,
  "what_went_well": [<string> — iyi giden maddeler, en az 2],
  "what_went_wrong": [<string> — kötü giden veya eksik kalan maddeler, en az 2],
  "incomplete_items": {
    "count": <int>,
    "story_points": <int>,
    "items": [<string — tamamlanmayan task adları, en fazla 10>]
  },
  "key_insights": [<string> — önemli gözlemler, 2-4 madde],
  "recommendations": [<string> — bir sonraki sprint için öneriler, 2-4 madde]
}

---

ÖNEMLİ: JSON içindeki tüm metin alanlarını (summary, what_went_well, what_went_wrong, key_insights, recommendations, items vb.) TÜRKÇE yaz. İngilizce metin kullanma.

Çıktıyı TAM OLARAK şu JSON yapısında ver (JSON dışında hiçbir şey yazma):
{
  "effortAnalysisJson": { ...effort analizi... },
  "userAnalysisJson": { ...kullanıcı analizi... },
  "sprintAnalysisJson": { ...sprint executive analizi... }
}`;
}

async function resolveSprintData(
  sprintIdNum: number,
  username: string,
  password: string,
): Promise<SprintWithIssues> {
  // Önce DB cache'e bak
  const cached = getCachedSprintIssuesJson(sprintIdNum);
  if (cached) {
    return JSON.parse(cached) as SprintWithIssues;
  }

  // Cache miss → Jira'dan çek ve kaydet
  const sprint = await getSprintIssues(
    { baseUrl: BASE_URL, username, password },
    sprintIdNum,
  );
  upsertSprintIssuesJson(sprintIdNum, JSON.stringify(sprint));
  return sprint;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sprintId: string }> },
) {
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_JIRA_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const { sprintId } = await params;
  const sprintIdNum = Number(sprintId);
  if (!Number.isInteger(sprintIdNum) || sprintIdNum <= 0) {
    return NextResponse.json({ error: "Geçersiz sprintId" }, { status: 400 });
  }

  const boardId = req.nextUrl.searchParams.get("boardId") ?? "unknown";
  const tokenParam = req.nextUrl.searchParams.get("token");

  let username: string;
  let password: string;

  if (tokenParam) {
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

  let sprintData: SprintWithIssues;
  try {
    sprintData = await resolveSprintData(sprintIdNum, username, password);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sprint verisi alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const tasks = sprintData.issues.map((issue) => ({
    task_id: issue.key,
    task_name: issue.summary,
    estimate: issue.storyPoints,
    owner: issue.assignee,
    status: issue.status.name,
    status_category: issue.status.statusCategory?.key ?? "unknown",
  }));

  const prompt = buildPrompt(
    {
      name: sprintData.name,
      startDate: sprintData.startDate,
      endDate: sprintData.endDate,
      completeDate: sprintData.completeDate,
      goal: sprintData.goal,
    },
    tasks,
  );

  let analysis: { effortAnalysisJson: unknown; userAnalysisJson: unknown; sprintAnalysisJson: unknown };
  try {
    analysis = await callGeminiJson(prompt);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini analizi başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  upsertAnalysis(
    boardId,
    String(sprintData.id),
    analysis.effortAnalysisJson ?? null,
    analysis.userAnalysisJson ?? null,
    analysis.sprintAnalysisJson ?? null,
  );

  return NextResponse.json({
    sprintId: sprintData.id,
    sprintName: sprintData.name,
    taskCount: tasks.length,
    effortAnalysisJson: analysis.effortAnalysisJson ?? null,
    userAnalysisJson: analysis.userAnalysisJson ?? null,
    sprintAnalysisJson: analysis.sprintAnalysisJson ?? null,
  });
}
