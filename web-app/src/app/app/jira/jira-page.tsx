"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";

import type { BoardMember, BoardSummary, SprintIssue, SprintSummary } from "@shared/jira";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type BoardsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; boards: BoardSummary[] };

type SprintsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; sprints: SprintSummary[] };

type BacklogState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; issues: SprintIssue[] };

type MembersState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; members: BoardMember[] };

type SprintRow = {
  id: number;
  name: string;
  state: string;
  storyPoints: number;
  startDate: string | null;
  endDate: string | null;
  completeDate: string | null;
};

// ─── Analysis types ───────────────────────────────────────────────────────────

type SkillSizeInsight = {
  typical_points: number;
  point_range: [number, number];
  task_count: number;
  description: string;
  reference_task_ids: string[];
};

type SkillData = {
  task_count: number;
  avg_estimate: number;
  median_estimate: number;
  min_estimate: number;
  max_estimate: number;
  common_keywords: string[];
  common_patterns: string[];
  size_point_insights: Record<string, SkillSizeInsight>;
  confidence: "low" | "medium" | "high";
};

type EffortAnalysis = {
  skill_distribution: Record<string, SkillData>;
  task_skill_mapping: Array<{
    task_id: string;
    task_name: string;
    estimate: number;
    detected_skills: Record<string, number>;
    assigned_primary_skill: string;
    assigned_size: string;
    reason: string;
  }>;
  global_skill_insights: string[];
};

type UserProfile = {
  owner: string;
  task_count: number;
  total_story_points: number;
  primary_skills: string[];
  skill_distribution: Record<string, number>;
  tasks: Array<{ task_id: string; task_name: string; estimate: number; skills: string[] }>;
};

type UserAnalysis = {
  user_profiles: UserProfile[];
};

type SprintAnalysis = {
  summary: string;
  overall_sentiment: "positive" | "neutral" | "negative";
  sprint_health_score: number;
  health_score_breakdown: {
    completion_task: number;
    completion_sp: number;
    quality_process: number;
    goal_achievement: number;
  };
  completion_rate: number;
  completed_story_points: number;
  total_story_points: number;
  what_went_well: string[];
  what_went_wrong: string[];
  incomplete_items: {
    count: number;
    story_points: number;
    items: string[];
  };
  key_insights: string[];
  recommendations: string[];
};

type SprintAnalysisResult = {
  sprintId: number;
  sprintName: string;
  taskCount: number;
  effortAnalysisJson: EffortAnalysis;
  userAnalysisJson: UserAnalysis;
  sprintAnalysisJson: SprintAnalysis;
};

type StoredAnalysisRow = {
  id: number;
  boardId: string;
  sprintId: string;
  effortAnalysisJson: EffortAnalysis;
  userAnalysisJson: UserAnalysis;
  sprintAnalysisJson: SprintAnalysis;
  createdAt: string;
};

type AnalysisModalState =
  | { open: false }
  | { open: true; status: "loading"; sprintName: string }
  | { open: true; status: "loaded"; sprintName: string; data: SprintAnalysisResult }
  | { open: true; status: "error"; sprintName: string; message: string };

type TaskEstimation = {
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

type EstimationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; estimations: TaskEstimation[] }
  | { status: "error"; message: string };

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StateBadge({ state }: { state: string }) {
  const lower = state.toLowerCase();
  if (lower === "closed")
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Tamamlandı
      </span>
    );
  if (lower === "active")
    return (
      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Aktif
      </span>
    );
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Planlı
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: "low" | "medium" | "high" }) {
  const map = {
    low: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    high: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  } as const;
  const label = { low: "Düşük", medium: "Orta", high: "Yüksek" } as const;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", map[confidence])}>
      {label[confidence]}
    </span>
  );
}

// ─── Analysis Modal ───────────────────────────────────────────────────────────

function healthScoreColor(score: number) {
  if (score >= 80) return { bar: "#22c55e", text: "text-green-600 dark:text-green-400", label: "Mükemmel" };
  if (score >= 60) return { bar: "#84cc16", text: "text-lime-600 dark:text-lime-400", label: "İyi" };
  if (score >= 40) return { bar: "#eab308", text: "text-yellow-600 dark:text-yellow-400", label: "Orta" };
  if (score >= 20) return { bar: "#f97316", text: "text-orange-600 dark:text-orange-400", label: "Zayıf" };
  return { bar: "#ef4444", text: "text-red-600 dark:text-red-400", label: "Kritik" };
}

function SprintTab({ sprint }: { sprint: SprintAnalysis }) {
  const sentimentColor = {
    positive: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    neutral: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  } as const;
  const sentimentLabel = { positive: "Olumlu", neutral: "Nötr", negative: "Olumsuz" } as const;
  const completionPct = Math.round((sprint.completion_rate ?? 0) * 100);
  const score = sprint.sprint_health_score ?? 0;
  const hc = healthScoreColor(score);
  const breakdown = sprint.health_score_breakdown;
  const breakdownItems = breakdown
    ? [
        { label: "Task Tamamlanma", value: breakdown.completion_task },
        { label: "SP Tamamlanma", value: breakdown.completion_sp },
        { label: "Kalite / Süreç", value: breakdown.quality_process },
        { label: "Hedef Başarısı", value: breakdown.goal_achievement },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Health Score + Özet yan yana */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
        {/* Sol: skor */}
        <div className="flex flex-col items-center justify-center rounded-md border px-8 py-4 gap-1">
          <p className={cn("text-6xl font-bold tabular-nums", hc.text)}>{score}</p>
          <p className="text-xs font-medium text-muted-foreground">Sprint Health</p>
          <span className={cn("mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", hc.text, "bg-current/10")}>
            {hc.label}
          </span>
          {/* Mini breakdown bar */}
          {breakdownItems.length > 0 && (
            <div className="mt-3 w-full space-y-1.5">
              {breakdownItems.map((item) => (
                <div key={item.label}>
                  <div className="mb-0.5 flex justify-between text-[10px] text-muted-foreground">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.value}%`, backgroundColor: hc.bar }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ: özet + metrikler */}
        <div className="rounded-md border p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Genel Özet</p>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", sentimentColor[sprint.overall_sentiment])}>
              {sentimentLabel[sprint.overall_sentiment]}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{sprint.summary}</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-muted p-2.5 text-center">
              <p className="text-xl font-bold">{completionPct}%</p>
              <p className="text-[11px] text-muted-foreground">Tamamlanma</p>
            </div>
            <div className="rounded-md bg-muted p-2.5 text-center">
              <p className="text-xl font-bold">{sprint.completed_story_points ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">Tamamlanan SP</p>
            </div>
            <div className="rounded-md bg-muted p-2.5 text-center">
              <p className="text-xl font-bold">{sprint.incomplete_items?.count ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">Eksik Task</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border p-4">
          <p className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">İyi Gidenler</p>
          <ul className="flex flex-col gap-1.5">
            {sprint.what_went_well?.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border p-4">
          <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">Geliştirilmesi Gerekenler</p>
          <ul className="flex flex-col gap-1.5">
            {sprint.what_went_wrong?.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {(sprint.incomplete_items?.items?.length ?? 0) > 0 && (
        <div className="rounded-md border p-4">
          <p className="mb-2 text-sm font-semibold">
            Tamamlanmayan Tasklar
            {sprint.incomplete_items.story_points > 0 && (
              <span className="ml-2 font-normal text-muted-foreground">({sprint.incomplete_items.story_points} SP)</span>
            )}
          </p>
          <ul className="flex flex-col gap-1">
            {sprint.incomplete_items.items.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground">• {item}</li>
            ))}
          </ul>
        </div>
      )}
      {sprint.recommendations?.length > 0 && (
        <div className="rounded-md border p-4">
          <p className="mb-2 text-sm font-semibold">Bir Sonraki Sprint İçin Öneriler</p>
          <ul className="flex flex-col gap-1.5">
            {sprint.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-blue-500" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      {sprint.key_insights?.length > 0 && (
        <div className="rounded-md border p-4">
          <p className="mb-2 text-sm font-semibold">Anahtar Gözlemler</p>
          <ul className="flex flex-col gap-1">
            {sprint.key_insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EffortTab({ effort }: { effort: EffortAnalysis }) {
  const skills = Object.entries(effort.skill_distribution);

  return (
    <div className="flex flex-col gap-6">
      {effort.global_skill_insights?.length > 0 && (
        <div className="rounded-md border p-4">
          <p className="mb-2 text-sm font-semibold">Genel Gözlemler</p>
          <ul className="flex flex-col gap-1">
            {effort.global_skill_insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {skills.map(([skill, data]) => (
        <div key={skill} className="rounded-md border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-mono text-sm font-semibold">{skill}</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{data.task_count} task</span>
              <span>ort. {data.avg_estimate?.toFixed(1)} SP</span>
              <ConfidenceBadge confidence={data.confidence} />
            </div>
          </div>

          {data.common_patterns?.length > 0 && (
            <div className="border-b px-4 py-3">
              <ul className="flex flex-col gap-1">
                {data.common_patterns.map((p, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.entries(data.size_point_insights ?? {}).length > 0 && (
            <div className="divide-y">
              {Object.entries(data.size_point_insights).map(([size, insight]) => (
                <div key={size} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <span className="mt-0.5 w-5 shrink-0 rounded bg-muted px-1 py-0.5 text-center font-mono text-xs font-bold">
                    {size}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-foreground">{insight.typical_points} SP</span>
                    <span className="mx-1.5 text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{insight.description}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {insight.task_count} task
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UserTab({ user }: { user: UserAnalysis }) {
  return (
    <div className="flex flex-col gap-4">
      {user.user_profiles?.map((profile) => (
        <div key={profile.owner} className="rounded-md border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-semibold">{profile.owner}</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{profile.task_count} task</span>
              <span>{profile.total_story_points} SP</span>
            </div>
          </div>

          {profile.primary_skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 py-3">
              {profile.primary_skills.map((skill) => {
                const pct = profile.skill_distribution[skill];
                return (
                  <span
                    key={skill}
                    className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-foreground"
                  >
                    {skill}
                    {pct !== undefined && (
                      <span className="ml-1 text-muted-foreground">
                        {Math.round(pct * 100)}%
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {profile.tasks?.length > 0 && (
            <div className="border-t">
              {profile.tasks.map((task) => (
                <div
                  key={task.task_id}
                  className="flex items-center gap-3 border-b px-4 py-2 last:border-0"
                >
                  <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
                    {task.task_id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{task.task_name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {task.skills?.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                    <span className="w-8 text-right text-xs text-muted-foreground">
                      {task.estimate ?? "—"} SP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AnalysisModal({
  state,
  onClose,
}: {
  state: AnalysisModalState;
  onClose: () => void;
}) {
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[62vw] max-w-[62vw] sm:max-w-[62vw] flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>
            {state.open ? state.sprintName : "Sprint Analizi"}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {state.open && state.status === "loading" && (
            <div className="flex h-40 items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Gemini analizi çalışıyor...
            </div>
          )}

          {state.open && state.status === "error" && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          {state.open && state.status === "loaded" && (
            <Tabs defaultValue="sprint">
              <TabsList className="mb-4">
                <TabsTrigger value="sprint">Sprint Analizi</TabsTrigger>
                <TabsTrigger value="effort">Effort Analizi</TabsTrigger>
                <TabsTrigger value="user">Kullanıcı Analizi</TabsTrigger>
              </TabsList>
              <TabsContent value="sprint">
                {state.data.sprintAnalysisJson ? (
                  <SprintTab sprint={state.data.sprintAnalysisJson} />
                ) : (
                  <p className="text-sm text-muted-foreground">Veri yok.</p>
                )}
              </TabsContent>
              <TabsContent value="effort">
                {state.data.effortAnalysisJson ? (
                  <EffortTab effort={state.data.effortAnalysisJson} />
                ) : (
                  <p className="text-sm text-muted-foreground">Veri yok.</p>
                )}
              </TabsContent>
              <TabsContent value="user">
                {state.data.userAnalysisJson ? (
                  <UserTab user={state.data.userAnalysisJson} />
                ) : (
                  <p className="text-sm text-muted-foreground">Veri yok.</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

function makeSprintColumns(
  onAnalyze: (sprint: SprintRow) => void,
  analyzingSprintId: number | null,
  analysisMap: Map<string, StoredAnalysisRow>,
  onShowAnalysis: (row: StoredAnalysisRow, sprintName: string) => void,
): ColumnDef<SprintRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Sprint Adı",
    },
    {
      accessorKey: "state",
      header: "Durum",
      cell: ({ row }) => <StateBadge state={row.original.state} />,
    },
    {
      accessorKey: "storyPoints",
      header: "SP Toplam",
      cell: ({ row }) => {
        const sp = row.original.storyPoints;
        return sp > 0 ? sp : "—";
      },
    },
    {
      accessorKey: "startDate",
      header: "Başlangıç",
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      id: "aiAnalysis",
      header: "AI Analizi",
      cell: ({ row }) => {
        const hasAnalysis = analysisMap.has(String(row.original.id));
        return hasAnalysis ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Analiz Edildi
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Edilmedi
          </span>
        );
      },
    },
    {
      id: "analyze",
      header: "Analiz",
      cell: ({ row }) => {
        const storedRow = analysisMap.get(String(row.original.id));
        const isLoading = analyzingSprintId === row.original.id;
        if (storedRow) {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onShowAnalysis(storedRow, row.original.name)}
              className="h-7 px-2.5 text-xs"
            >
              Analizi Göster
            </Button>
          );
        }
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAnalyze(row.original)}
            disabled={analyzingSprintId !== null}
            className="h-7 px-2.5 text-xs"
          >
            {isLoading ? <Loader2 className="size-3 animate-spin" /> : "Analiz Et"}
          </Button>
        );
      },
    },
  ];
}

// ─── Sprint bar chart sub-component ──────────────────────────────────────────

const sprintChartConfig = {
  storyPoints: {
    label: "Story Points",
    color: "#22c55e",
  },
} satisfies ChartConfig;

function SprintBarChart({ data }: { data: SprintRow[] }) {
  const chartData = [...data].reverse();

  const avgExact =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.storyPoints, 0) / data.length
      : 0;
  const avgDisplay = Math.round(avgExact);

  function barColor(sp: number): string {
    if (sp > avgExact) return "#22c55e";
    if (sp < avgExact) return "#ef4444";
    return "#6b7280";
  }

  return (
    <div className="rounded-md border p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Sprint Story Points</p>
        <p className="text-sm text-muted-foreground">
          Ortalama: <span className="font-semibold text-foreground">{avgDisplay} SP</span>
        </p>
      </div>
      <ChartContainer config={sprintChartConfig} className="h-64 w-full">
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            tickFormatter={(value: string) => {
              const parts = value.trim().split(/\s+/);
              return parts[parts.length - 1] ?? value;
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            width={32}
          />
          <ReferenceLine
            y={avgExact}
            stroke="#6b7280"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label) => String(label)}
              />
            }
          />
          <Bar
            dataKey="storyPoints"
            radius={[4, 4, 0, 0]}
            minPointSize={2}
          >
            {chartData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={barColor(entry.storyPoints)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

// ─── Sprint table sub-component ───────────────────────────────────────────────

function SprintTable({
  data,
  onSelectionChange,
  onAnalyze,
  analyzingSprintId,
  analysisMap,
  onShowAnalysis,
}: {
  data: SprintRow[];
  onSelectionChange: (selected: SprintRow[]) => void;
  onAnalyze: (sprint: SprintRow) => void;
  analyzingSprintId: number | null;
  analysisMap: Map<string, StoredAnalysisRow>;
  onShowAnalysis: (row: StoredAnalysisRow, sprintName: string) => void;
}) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo(
    () => makeSprintColumns(onAnalyze, analyzingSprintId, analysisMap, onShowAnalysis),
    [onAnalyze, analyzingSprintId, analysisMap, onShowAnalysis],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.id),
    state: { rowSelection },
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  });

  useEffect(() => {
    onSelectionChange(
      table.getSelectedRowModel().rows.map((r) => r.original),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedRows.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className={h.id === "select" ? "w-10" : ""}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Sprint bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{data.length} sprint</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Sayfa {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Backlog table sub-component ─────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-muted-foreground">—</span>;
  const lower = priority.toLowerCase();
  const color =
    lower === "highest" || lower === "blocker"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : lower === "high"
        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
        : lower === "medium"
          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          : lower === "low" || lower === "lowest"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {priority}
    </span>
  );
}

// backlogColumns defined inside BacklogTable (moved to useMemo for AI data)

// ─── Estimation card ─────────────────────────────────────────────────────────

function EstimationCard({ est }: { est: TaskEstimation }) {
  const confidenceColors = {
    low: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    high: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  } as const;
  const confidenceLabels = { low: "Düşük", medium: "Orta", high: "Yüksek" } as const;

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{est.task_id}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                confidenceColors[est.confidence],
              )}
            >
              {confidenceLabels[est.confidence]}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium leading-snug">{est.task_name}</p>
        </div>

        {/* Story points badge */}
        <div className="flex shrink-0 flex-col items-center rounded-lg bg-muted px-3 py-1.5 text-center">
          <span className="text-xl font-bold leading-none">{est.estimated_story_points}</span>
          <span className="mt-0.5 text-xs text-muted-foreground">SP</span>
          <span className="text-xs text-muted-foreground">
            [{est.story_point_range[0]}–{est.story_point_range[1]}]
          </span>
        </div>
      </div>

      {/* Skill + assignee row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Skill:</span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{est.primary_skill}</span>
        </div>
        {est.suggested_assignee && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Atanacak:</span>
            <span className="text-xs font-medium">{est.suggested_assignee}</span>
          </div>
        )}
      </div>

      {/* Reasoning */}
      {est.reasoning && (
        <p className="text-xs text-muted-foreground">{est.reasoning}</p>
      )}
      {est.assignee_reasoning && est.suggested_assignee && (
        <p className="text-xs text-muted-foreground italic">{est.assignee_reasoning}</p>
      )}
    </div>
  );
}

function BacklogTable({ issues, boardId, avgSprintSP }: { issues: SprintIssue[]; boardId: string; avgSprintSP: number | null }) {
  const [estimation, setEstimation] = useState<EstimationState>({ status: "idle" });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [aiData, setAiData] = useState<Map<string, { assignee: string | null; sp: number }>>(new Map());

  useEffect(() => {
    if (!boardId) return;
    fetch(`/api/jira/boards/${boardId}/backlog-analyses`)
      .then((r) => r.json())
      .then((data: { analyses?: { results: TaskEstimation[] }[] }) => {
        const map = new Map<string, { assignee: string | null; sp: number }>();
        for (const analysis of data.analyses ?? []) {
          for (const est of analysis.results ?? []) {
            if (!map.has(est.task_id)) {
              map.set(est.task_id, { assignee: est.suggested_assignee, sp: est.estimated_story_points });
            }
          }
        }
        setAiData(map);
      })
      .catch(() => undefined);
  }, [boardId]);

  const columns = useMemo<ColumnDef<SprintIssue>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Tümünü seç"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={row.getToggleSelectedHandler()}
          aria-label="Satırı seç"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "key",
      header: "Anahtar",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.key}
        </span>
      ),
    },
    {
      accessorKey: "summary",
      header: "Başlık",
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm leading-snug">
          {row.original.summary}
        </span>
      ),
    },
    {
      accessorKey: "storyPoints",
      header: "SP",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.storyPoints ?? "—"}</span>
      ),
    },
    {
      accessorKey: "assignee",
      header: "Atanan",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.assignee ?? "—"}
        </span>
      ),
    },
    {
      id: "ai_assignee",
      header: "AI Atama",
      cell: ({ row }) => {
        const d = aiData.get(row.original.key);
        return (
          <span className="text-sm text-muted-foreground">{d?.assignee ?? "—"}</span>
        );
      },
    },
    {
      id: "ai_sp",
      header: "AI SP",
      cell: ({ row }) => {
        const d = aiData.get(row.original.key);
        return (
          <span className="text-sm font-medium">{d != null ? d.sp : "—"}</span>
        );
      },
    },
  ], [aiData]);

  const table = useReactTable({
    data: issues,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    state: { rowSelection },
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  });

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const selectedIssues = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedIssues.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Backlog</h2>
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} seçili · ` : ""}
          {issues.length} task
        </span>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className={h.id === "select" ? "w-10" : ""}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Backlog boş.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">
          Sayfa {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Önceki
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Sonraki
        </Button>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-wrap gap-2">
            {selectedIssues.map((issue) => (
              <span
                key={issue.id}
                className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium text-foreground"
              >
                {issue.key}
              </span>
            ))}
          </div>
          <Button
            className="self-start"
            disabled={estimation.status === "loading"}
            onClick={async () => {
              setEstimation({ status: "loading" });
              try {
                const res = await fetch(`/api/jira/boards/${boardId}/task-estimation`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ taskIds: selectedIssues.map((i) => i.key) }),
                });
                const data = await res.json() as { estimations?: TaskEstimation[]; error?: string };
                if (!res.ok) {
                  setEstimation({ status: "error", message: data.error ?? "Analiz başarısız" });
                } else {
                  setEstimation({ status: "loaded", estimations: data.estimations ?? [] });
                }
              } catch {
                setEstimation({ status: "error", message: "Ağ hatası, lütfen tekrar deneyin." });
              }
            }}
          >
            {estimation.status === "loading" ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />Analiz ediliyor...</>
            ) : (
              "Backlog'u Analiz Et"
            )}
          </Button>
        </div>
      )}

      {estimation.status === "error" && (
        <p className="text-sm text-destructive">{estimation.message}</p>
      )}

      {estimation.status === "loaded" && estimation.estimations.length > 0 && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Tahmin Sonuçları</p>
            <span className="text-xs text-muted-foreground">{estimation.estimations.length} task</span>
          </div>

          {/* Capacity comparison card */}
          {avgSprintSP != null && (() => {
            const totalSP = estimation.estimations.reduce((s, e) => s + e.estimated_story_points, 0);
            const ratio = totalSP / avgSprintSP;
            const diff = totalSP - avgSprintSP;
            const overloaded = ratio > 1.2;
            const underloaded = ratio < 0.8;
            const color = overloaded
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
              : underloaded
                ? "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
                : "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30";
            const textColor = overloaded
              ? "text-red-700 dark:text-red-400"
              : underloaded
                ? "text-yellow-700 dark:text-yellow-400"
                : "text-green-700 dark:text-green-400";
            const message = overloaded
              ? `Seçilen tasklar sprint kapasitesini ${Math.abs(diff)} SP aşıyor. Bazı taskları bir sonraki sprinte taşımayı düşünün.`
              : underloaded
                ? `Seçilen tasklar sprint kapasitesinin ${Math.round((1 - ratio) * 100)}% altında. Backlog'dan ek task ekleyebilirsiniz.`
                : "Seçilen taskların tahmini story point toplamı sprint kapasitesiyle uyumlu.";
            return (
              <div className={`rounded-md border p-4 ${color}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className={`text-sm font-semibold ${textColor}`}>Kapasite Karşılaştırması</p>
                    <p className="text-xs text-muted-foreground">{message}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">{totalSP}</span>
                      <span className="text-xs text-muted-foreground">Tahmini SP</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">{avgSprintSP}</span>
                      <span className="text-xs text-muted-foreground">Ort. Sprint SP</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-bold ${textColor}`}>
                        {diff > 0 ? "+" : ""}{diff}
                      </span>
                      <span className="text-xs text-muted-foreground">Fark</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Summary table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Task</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead className="w-16 text-center">SP</TableHead>
                  <TableHead className="w-24 text-center">Aralık</TableHead>
                  <TableHead className="w-32">Atanacak</TableHead>
                  <TableHead className="w-20">Güven</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimation.estimations.map((est) => (
                  <TableRow key={est.task_id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{est.task_id}</TableCell>
                    <TableCell className="max-w-xs">
                      <span className="line-clamp-2 text-sm">{est.task_name}</span>
                    </TableCell>
                    <TableCell className="text-center text-sm font-semibold">{est.estimated_story_points}</TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {est.story_point_range[0]}–{est.story_point_range[1]}
                    </TableCell>
                    <TableCell className="text-sm">{est.suggested_assignee ?? "—"}</TableCell>
                    <TableCell>
                      <ConfidenceBadge confidence={est.confidence} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Detail cards */}
          {estimation.estimations.map((est) => (
            <EstimationCard key={est.task_id} est={est} />
          ))}

          {/* Save button */}
          <div className="flex items-center gap-3 border-t pt-4">
            <Button
              variant="outline"
              disabled={saveState === "saving" || saveState === "saved"}
              onClick={async () => {
                setSaveState("saving");
                try {
                  const res = await fetch(`/api/jira/boards/${boardId}/backlog-analyses`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estimations: estimation.estimations }),
                  });
                  if (res.ok) {
                    setAiData((prev) => {
                      const next = new Map(prev);
                      for (const est of estimation.estimations) {
                        next.set(est.task_id, { assignee: est.suggested_assignee, sp: est.estimated_story_points });
                      }
                      return next;
                    });
                    setSaveState("saved");
                  } else {
                    setSaveState("error");
                  }
                } catch {
                  setSaveState("error");
                }
              }}
            >
              {saveState === "saving" ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Kaydediliyor...</>
              ) : saveState === "saved" ? (
                "Kaydedildi ✓"
              ) : (
                "Kaydet"
              )}
            </Button>
            {saveState === "error" && (
              <span className="text-xs text-destructive">Kayıt başarısız, tekrar deneyin.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Member card sub-component ───────────────────────────────────────────────

function MemberCard({ member }: { member: BoardMember }) {
  const initials = member.displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/jira/avatar?url=${encodeURIComponent(member.avatarUrl)}`}
            alt={member.displayName}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-sm font-medium text-muted-foreground">
            {initials}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.displayName}</p>
        {member.emailAddress && (
          <p className="truncate text-xs text-muted-foreground">
            {member.emailAddress}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

export function JiraPage() {
  const [boards, setBoards] = useState<BoardsState>({ status: "loading" });
  const [selectedBoard, setSelectedBoard] = useState<BoardSummary | null>(null);
  const [open, setOpen] = useState(false);
  const [sprints, setSprints] = useState<SprintsState>({ status: "idle" });
  const [selectedSprints, setSelectedSprints] = useState<SprintRow[]>([]);
  const [sprintLimit, setSprintLimit] = useState(10);
  const [backlog, setBacklog] = useState<BacklogState>({ status: "idle" });
  const [members, setMembers] = useState<MembersState>({ status: "idle" });
  const [analysisModal, setAnalysisModal] = useState<AnalysisModalState>({ open: false });
  const [analyzingSprintId, setAnalyzingSprintId] = useState<number | null>(null);
  const [analysisMap, setAnalysisMap] = useState<Map<string, StoredAnalysisRow>>(new Map());

  useEffect(() => {
    fetch("/api/jira/boards")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setBoards({ status: "error", message: data.error });
        } else {
          setBoards({ status: "loaded", boards: data.boards as BoardSummary[] });
        }
      })
      .catch(() => setBoards({ status: "error", message: "Board'lar alınamadı" }));
  }, []);

  async function handleOpenBoard() {
    if (!selectedBoard) return;
    setSprints({ status: "loading" });
    setBacklog({ status: "loading" });
    setMembers({ status: "loading" });
    setSelectedSprints([]);
    setAnalysisMap(new Map());

    const [sprintRes, backlogRes, membersRes, analysesRes] = await Promise.all([
      fetch(`/api/jira/boards/${selectedBoard.id}/sprint-history?limit=${sprintLimit}`),
      fetch(`/api/jira/boards/${selectedBoard.id}/backlog`),
      fetch(`/api/jira/boards/${selectedBoard.id}/members`),
      fetch(`/api/jira/boards/${selectedBoard.id}/analyses?limit=${sprintLimit}`),
    ]);

    const [sprintData, backlogData, membersData, analysesData] = await Promise.all([
      sprintRes.json(),
      backlogRes.json(),
      membersRes.json(),
      analysesRes.json(),
    ]);

    setSprints(
      sprintRes.ok
        ? { status: "loaded", sprints: sprintData.sprints as SprintSummary[] }
        : { status: "error", message: sprintData.error ?? "Sprint geçmişi alınamadı" },
    );

    setBacklog(
      backlogRes.ok
        ? { status: "loaded", issues: backlogData.issues as SprintIssue[] }
        : { status: "error", message: backlogData.error ?? "Backlog alınamadı" },
    );

    setMembers(
      membersRes.ok
        ? { status: "loaded", members: membersData.members as BoardMember[] }
        : { status: "error", message: membersData.error ?? "Üyeler alınamadı" },
    );

    if (analysesRes.ok && Array.isArray(analysesData.analyses)) {
      const map = new Map<string, StoredAnalysisRow>();
      for (const row of analysesData.analyses as StoredAnalysisRow[]) {
        map.set(row.sprintId, row);
      }
      setAnalysisMap(map);
    }
  }

  const handleAnalyzeSprint = useCallback(async (sprint: SprintRow) => {
    setAnalyzingSprintId(sprint.id);
    setAnalysisModal({ open: true, status: "loading", sprintName: sprint.name });

    try {
      const boardId = selectedBoard?.id ?? "";
      const res = await fetch(`/api/jira/sprints/${sprint.id}/analysis?boardId=${boardId}`);
      const data = await res.json() as SprintAnalysisResult & { error?: string };
      if (!res.ok) {
        setAnalysisModal({
          open: true,
          status: "error",
          sprintName: sprint.name,
          message: data.error ?? "Analiz başarısız",
        });
      } else {
        setAnalysisModal({
          open: true,
          status: "loaded",
          sprintName: sprint.name,
          data,
        });
        setAnalysisMap((prev) => {
          const next = new Map(prev);
          next.set(String(sprint.id), {
            id: Date.now(),
            boardId: String(boardId),
            sprintId: String(sprint.id),
            effortAnalysisJson: data.effortAnalysisJson,
            userAnalysisJson: data.userAnalysisJson,
            sprintAnalysisJson: data.sprintAnalysisJson,
            createdAt: new Date().toISOString(),
          });
          return next;
        });
      }
    } catch {
      setAnalysisModal({
        open: true,
        status: "error",
        sprintName: sprint.name,
        message: "Ağ hatası, lütfen tekrar deneyin.",
      });
    } finally {
      setAnalyzingSprintId(null);
    }
  }, [selectedBoard]);

  const handleShowAnalysis = useCallback((row: StoredAnalysisRow, sprintName: string) => {
    setAnalysisModal({
      open: true,
      status: "loaded",
      sprintName,
      data: {
        sprintId: Number(row.sprintId),
        sprintName,
        taskCount: 0,
        effortAnalysisJson: row.effortAnalysisJson,
        userAnalysisJson: row.userAnalysisJson,
        sprintAnalysisJson: row.sprintAnalysisJson,
      },
    });
  }, []);

  // Compute sprint rows from raw data, sorted latest-first
  const sprintRows = useMemo<SprintRow[]>(() => {
    if (sprints.status !== "loaded") return [];
    return sprints.sprints
      .map((s) => ({
        id: s.id,
        name: s.name,
        state: "closed",
        storyPoints: s.totalStoryPoints,
        startDate: s.startDate,
        endDate: s.endDate,
        completeDate: s.completeDate,
      }))
      .sort((a, b) => {
        const aDate = a.endDate ?? a.completeDate ?? "";
        const bDate = b.endDate ?? b.completeDate ?? "";
        return bDate.localeCompare(aDate);
      });
  }, [sprints]);

  const avgSprintSP = useMemo<number | null>(() => {
    if (sprintRows.length === 0) return null;
    const total = sprintRows.reduce((s, r) => s + r.storyPoints, 0);
    return Math.round(total / sprintRows.length);
  }, [sprintRows]);

  const boardList = boards.status === "loaded" ? boards.boards : [];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jira</h1>
        <p className="text-sm text-muted-foreground">
          Board seçin ve sprint geçmişini görüntüleyin.
        </p>
      </div>

      {/* Board selector */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
              disabled={boards.status === "loading"}
            >
              {boards.status === "loading"
                ? "Board'lar yükleniyor..."
                : (selectedBoard?.name ?? "Board seçin...")}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Board ara..." />
              <CommandList>
                <CommandEmpty>Board bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {boardList.map((board) => (
                    <CommandItem
                      key={board.id}
                      value={`${board.name} ${board.projectKey ?? ""}`}
                      onSelect={() => {
                        setSelectedBoard(board);
                        setSprints({ status: "idle" });
                        setBacklog({ status: "idle" });
                        setMembers({ status: "idle" });
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selectedBoard?.id === board.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <span className="flex-1 truncate">{board.name}</span>
                      {board.projectKey && (
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {board.projectKey}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select
          value={String(sprintLimit)}
          onValueChange={(v) => setSprintLimit(Number(v))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sprint Sayısı" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} sprint
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleOpenBoard}
          disabled={!selectedBoard || sprints.status === "loading"}
        >
          {sprints.status === "loading" ? "Yükleniyor..." : "Board'u Aç"}
        </Button>
      </div>

      {boards.status === "error" && (
        <p className="text-sm text-destructive">{boards.message}</p>
      )}

      {/* Loading skeleton — tab'lar gizli */}
      {sprints.status === "loading" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
          <Skeleton className="h-64 w-full rounded-md" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      )}

      {/* Tabs — yalnızca veriler gelince görünür */}
      {(sprints.status === "loaded" || sprints.status === "error") && (
        <Tabs defaultValue="sprints">
          <TabsList className="h-11">
            <TabsTrigger value="sprints" className="px-5 text-sm font-medium">
              Sprintler
            </TabsTrigger>
            <TabsTrigger value="backlog" className="px-5 text-sm font-medium">
              Backlog
            </TabsTrigger>
            <TabsTrigger value="members" className="px-5 text-sm font-medium">
              Üyeler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sprints" className="flex flex-col gap-6 pt-4">
            {sprints.status === "error" && (
              <p className="text-sm text-destructive">{sprints.message}</p>
            )}
            {sprints.status === "loaded" && (
              <>
                <SprintBarChart data={sprintRows} />
                <SprintTable
                  data={sprintRows}
                  onSelectionChange={setSelectedSprints}
                  onAnalyze={handleAnalyzeSprint}
                  analyzingSprintId={analyzingSprintId}
                  analysisMap={analysisMap}
                  onShowAnalysis={handleShowAnalysis}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="backlog" className="flex flex-col gap-6 pt-4">
            {backlog.status === "loading" && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            )}
            {backlog.status === "error" && (
              <p className="text-sm text-destructive">{backlog.message}</p>
            )}
            {backlog.status === "loaded" && (
              <BacklogTable issues={backlog.issues} boardId={String(selectedBoard?.id ?? "")} avgSprintSP={avgSprintSP} />
            )}
          </TabsContent>

          <TabsContent value="members" className="pt-4">
            {members.status === "loading" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-md" />
                ))}
              </div>
            )}
            {members.status === "error" && (
              <p className="text-sm text-destructive">{members.message}</p>
            )}
            {members.status === "loaded" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Üyeler</h2>
                  <span className="text-sm text-muted-foreground">
                    {members.members.length} üye
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {members.members.map((member) => (
                    <MemberCard key={member.accountId} member={member} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <AnalysisModal
        state={analysisModal}
        onClose={() => setAnalysisModal({ open: false })}
      />

      {/* suppress unused-vars warning for selectedSprints */}
      {selectedSprints.length > 0 && null}
    </div>
  );
}
