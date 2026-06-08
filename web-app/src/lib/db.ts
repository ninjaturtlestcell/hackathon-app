import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "jira_analysis.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS jira_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boardId TEXT NOT NULL,
        sprintId TEXT NOT NULL,
        effortAnalysisJson TEXT NOT NULL,
        userAnalysisJson TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sprints (
        sprint_id INTEGER PRIMARY KEY,
        issues_json TEXT NOT NULL,
        fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS backlog_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id TEXT NOT NULL,
        task_count INTEGER NOT NULL,
        results_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    try {
      db.exec(`ALTER TABLE jira_analysis ADD COLUMN sprintAnalysisJson TEXT NOT NULL DEFAULT '{}'`);
    } catch {
      // column already exists
    }
  }
  return db;
}

export interface AnalysisRow {
  id: number;
  boardId: string;
  sprintId: string;
  effortAnalysisJson: unknown;
  userAnalysisJson: unknown;
  sprintAnalysisJson: unknown;
  createdAt: string;
}

export function getAnalysesByBoard(boardId: string): AnalysisRow[] {
  const rows = getDb()
    .prepare(
      `SELECT id, boardId, sprintId, effortAnalysisJson, userAnalysisJson, sprintAnalysisJson, createdAt
       FROM jira_analysis
       WHERE boardId = ?
       ORDER BY createdAt DESC`
    )
    .all(boardId) as { id: number; boardId: string; sprintId: string; effortAnalysisJson: string; userAnalysisJson: string; sprintAnalysisJson: string; createdAt: string }[];

  return rows.map((row) => ({
    ...row,
    effortAnalysisJson: JSON.parse(row.effortAnalysisJson),
    userAnalysisJson: JSON.parse(row.userAnalysisJson),
    sprintAnalysisJson: JSON.parse(row.sprintAnalysisJson),
  }));
}

export function upsertAnalysis(
  boardId: string,
  sprintId: string,
  effortAnalysisJson: unknown,
  userAnalysisJson: unknown,
  sprintAnalysisJson: unknown,
): void {
  getDb()
    .prepare(
      `INSERT INTO jira_analysis (boardId, sprintId, effortAnalysisJson, userAnalysisJson, sprintAnalysisJson)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      boardId,
      sprintId,
      JSON.stringify(effortAnalysisJson),
      JSON.stringify(userAnalysisJson),
      JSON.stringify(sprintAnalysisJson),
    );
}

export function getCachedSprintIssuesJson(sprintId: number): string | null {
  const row = (getDb()
    .prepare(
      `SELECT issues_json FROM sprints
       WHERE sprint_id = ? AND fetched_at > datetime('now', '-1 day')`
    )
    .get(sprintId)) as { issues_json: string } | undefined;
  return row?.issues_json ?? null;
}

export interface BacklogAnalysisRow {
  id: number;
  boardId: string;
  taskCount: number;
  results: unknown[];
  createdAt: string;
}

export function saveBacklogAnalysis(boardId: string, estimations: unknown[]): number {
  const result = getDb()
    .prepare(
      `INSERT INTO backlog_analyses (board_id, task_count, results_json)
       VALUES (?, ?, ?)`
    )
    .run(boardId, estimations.length, JSON.stringify(estimations));
  return Number(result.lastInsertRowid);
}

export function getBacklogAnalysesByBoard(boardId: string): BacklogAnalysisRow[] {
  const rows = getDb()
    .prepare(
      `SELECT id, board_id, task_count, results_json, created_at
       FROM backlog_analyses
       WHERE board_id = ?
       ORDER BY created_at DESC`
    )
    .all(boardId) as {
      id: number;
      board_id: string;
      task_count: number;
      results_json: string;
      created_at: string;
    }[];
  return rows.map((row) => ({
    id: row.id,
    boardId: row.board_id,
    taskCount: row.task_count,
    results: JSON.parse(row.results_json) as unknown[],
    createdAt: row.created_at,
  }));
}

export function upsertSprintIssuesJson(sprintId: number, issuesJson: string): void {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO sprints (sprint_id, issues_json, fetched_at)
       VALUES (?, ?, datetime('now'))`
    )
    .run(sprintId, issuesJson);
}
