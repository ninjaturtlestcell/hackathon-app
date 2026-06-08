"use client";

import { useState } from "react";

import type { AgileModels, Version2Models } from "@shared/jira";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "authenticated"; user: Version2Models.User; credentials: string };

type IssuesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; issues: AgileModels.Issue[]; total: number };

export function JiraPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState<AuthState>({ status: "idle" });

  const [boardId, setBoardId] = useState("");
  const [issues, setIssues] = useState<IssuesState>({ status: "idle" });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuth({ status: "loading" });

    const res = await fetch("/api/jira/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAuth({ status: "error", message: data.error ?? "Giriş başarısız" });
      return;
    }

    setAuth({
      status: "authenticated",
      user: data.user as Version2Models.User,
      credentials: btoa(`${username}:${password}`),
    });
  }

  async function handleFetchIssues(e: React.FormEvent) {
    e.preventDefault();
    if (auth.status !== "authenticated") return;

    setIssues({ status: "loading" });

    const res = await fetch(`/api/jira/boards/${boardId}/issues`, {
      headers: { "x-jira-auth": auth.credentials },
    });

    const data = await res.json();
    console.log("[jira] board issues response:", data);

    if (!res.ok) {
      setIssues({ status: "error", message: data.error ?? "Task'lar alınamadı" });
      return;
    }

    setIssues({
      status: "loaded",
      issues: data.issues as AgileModels.Issue[],
      total: data.total as number,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jira</h1>
        <p className="text-sm text-muted-foreground">
          Jira hesabınıza bağlanın ve board task&apos;larını görüntüleyin.
        </p>
      </div>

      {auth.status !== "authenticated" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Giriş Yap</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="jira-username">
              Kullanıcı Adı / E-posta
            </label>
            <Input
              id="jira-username"
              type="text"
              autoComplete="username"
              placeholder="ornek@sirket.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="jira-password">
              Şifre / API Token
            </label>
            <Input
              id="jira-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {auth.status === "error" && (
            <p className="text-sm text-destructive">{auth.message}</p>
          )}

          <Button type="submit" disabled={auth.status === "loading"}>
            {auth.status === "loading" ? "Bağlanıyor..." : "Giriş Yap"}
          </Button>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {(auth.user.displayName ?? auth.user.name ?? "J")[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {auth.user.displayName ?? auth.user.name}
              </span>
              {auth.user.emailAddress && (
                <span className="text-xs text-muted-foreground">
                  {auth.user.emailAddress}
                </span>
              )}
            </div>
            <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Bağlı
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAuth({ status: "idle" });
                setIssues({ status: "idle" });
                setUsername("");
                setPassword("");
              }}
            >
              Çıkış
            </Button>
          </div>

          <form onSubmit={handleFetchIssues} className="flex gap-2">
            <Input
              type="number"
              placeholder="Board ID (örn. 42)"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={issues.status === "loading"}>
              {issues.status === "loading" ? "Yükleniyor..." : "Taskları Getir"}
            </Button>
          </form>

          {issues.status === "error" && (
            <p className="text-sm text-destructive">{issues.message}</p>
          )}

          {issues.status === "loaded" && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                {issues.issues.length} / {issues.total} task gösteriliyor
              </p>
              <ul className="flex flex-col gap-2">
                {issues.issues.map((issue) => (
                  <li
                    key={issue.id}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {issue.key}
                      </span>
                      {issue.fields?.status?.name && (
                        <StatusBadge name={issue.fields.status.name} />
                      )}
                    </div>
                    <p className="text-sm font-medium leading-snug">
                      {issue.fields?.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {issue.fields?.issuetype?.name && (
                        <span>{issue.fields.issuetype.name}</span>
                      )}
                      {issue.fields?.priority?.name && (
                        <>
                          <span>·</span>
                          <span>{issue.fields.priority.name}</span>
                        </>
                      )}
                      {issue.fields?.assignee?.displayName && (
                        <>
                          <span>·</span>
                          <span>{issue.fields.assignee.displayName}</span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ name }: { name: string }) {
  const lower = name.toLowerCase();
  const color =
    lower.includes("done") || lower.includes("closed") || lower.includes("resolved")
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : lower.includes("progress") || lower.includes("review")
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : lower.includes("block")
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-muted text-muted-foreground";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {name}
    </span>
  );
}
