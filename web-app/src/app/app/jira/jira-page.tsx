"use client";

import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Check, ChevronsUpDown } from "lucide-react";

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

// ─── Column definitions ───────────────────────────────────────────────────────

const sprintColumns: ColumnDef<SprintRow>[] = [
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
    id: "aiTraining",
    header: "AI Eğitim",
    cell: () => "—",
  },
];

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
}: {
  data: SprintRow[];
  onSelectionChange: (selected: SprintRow[]) => void;
}) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns: sprintColumns,
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
                  colSpan={sprintColumns.length}
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
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} sprint seçili`
            : `${data.length} sprint`}
        </span>
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

      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-wrap gap-2">
            {selectedRows.map((sprint) => (
              <span
                key={sprint.id}
                className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground"
              >
                {sprint.name}
              </span>
            ))}
          </div>
          <Button className="self-start" onClick={() => {}}>
            Sprintleri Analiz Et
          </Button>
        </div>
      )}
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

const backlogColumns: ColumnDef<SprintIssue>[] = [
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
    accessorKey: "issueType",
    header: "Tür",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.issueType || "—"}</span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Öncelik",
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
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
    id: "status",
    accessorFn: (row) => row.status.name,
    header: "Durum",
    cell: ({ row }) => <StateBadge state={row.original.status.name} />,
  },
];

function BacklogTable({ issues }: { issues: SprintIssue[] }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data: issues,
    columns: backlogColumns,
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
                  colSpan={backlogColumns.length}
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
          <Button className="self-start" onClick={() => {}}>
            Sprint&apos;i Analiz Et
          </Button>
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

    const [sprintRes, backlogRes, membersRes] = await Promise.all([
      fetch(`/api/jira/boards/${selectedBoard.id}/sprint-history?limit=${sprintLimit}`),
      fetch(`/api/jira/boards/${selectedBoard.id}/backlog`),
      fetch(`/api/jira/boards/${selectedBoard.id}/members`),
    ]);

    const [sprintData, backlogData, membersData] = await Promise.all([
      sprintRes.json(),
      backlogRes.json(),
      membersRes.json(),
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
  }

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
                <SprintTable data={sprintRows} onSelectionChange={setSelectedSprints} />
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
              <BacklogTable issues={backlog.issues} />
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
    </div>
  );
}
