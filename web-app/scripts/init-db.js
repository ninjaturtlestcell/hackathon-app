const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "jira_analysis.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS jira_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    boardId TEXT NOT NULL,
    sprintId TEXT NOT NULL,
    effortAnalysisJson TEXT NOT NULL,
    userAnalysisJson TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

console.log("DB created at:", DB_PATH);
console.log("Tables:", db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
db.close();
