"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Brain,
  GitBranch,
  Users,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";

import fatihTelis from "@shared/assets/members/fatih-telis.jpeg";
import enesAydin from "@shared/assets/members/enes-aydin.jpeg";
import sametTopakkaya from "@shared/assets/members/samet-topakkaya.jpeg";
import omerYusufMutlu from "@shared/assets/members/omer-yusuf-mutlu.jpeg";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

// ─── Feature cards data ───────────────────────────────────────────────────────

const features = [
  {
    icon: BarChart3,
    title: "Sprint Analytics",
    description:
      "Visualize sprint story point history across boards. Compare velocity trends and spot patterns across your team's delivery cadence.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Gemini AI analyzes your sprint data to surface effort distribution, skill patterns and sizing consistency you'd otherwise miss.",
  },
  {
    icon: GitBranch,
    title: "Backlog Intelligence",
    description:
      "Browse your full backlog with priority, type and assignee filters. Select issues and trigger instant analysis.",
  },
  {
    icon: Users,
    title: "Team Profiles",
    description:
      "Understand per-developer skill distribution and story point ownership. See who owns what kind of work.",
  },
  {
    icon: TrendingUp,
    title: "Velocity Tracking",
    description:
      "Average story points per sprint with color-coded above/below trend bars. Historical data at a glance.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description:
      "Connect your Jira board in seconds. No configuration files, no schema changes — just paste your credentials and go.",
  },
] as const;

// ─── Team members data ────────────────────────────────────────────────────────

const teamMembers = [
  {
    name: "Fatih Telis",
    role: "FE Developer",
    image: fatihTelis,
  },
  {
    name: "Enes Aydın",
    role: "Analist",
    image: enesAydin,
  },
  {
    name: "Samet Topakkaya",
    role: "BE Developer",
    image: sametTopakkaya,
  },
  {
    name: "Ömer Yusuf Mutlu",
    role: "BE Developer",
    image: omerYusufMutlu,
  },
] as const;

// ─── Steps data ───────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Connect Jira",
    description: "Authenticate with your Jira account from the settings panel.",
  },
  {
    number: "02",
    title: "Select a Board",
    description: "Pick any Scrum board. Sprint history loads automatically.",
  },
  {
    number: "03",
    title: "Run Analysis",
    description:
      "Choose a sprint and let Gemini AI generate a detailed effort and user breakdown.",
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
          <Zap className="size-3" />
          {t("landing.badge")}
        </Badge>

        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Jira sprint analysis,{" "}
            <span className="text-muted-foreground">powered by AI</span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
            Connect your Jira board, explore sprint history and let Gemini AI
            surface effort distribution, team skill patterns and velocity
            insights — all in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              {t("landing.getStarted")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/app">{t("landing.goToApp")}</Link>
          </Button>
        </div>

        {/* Social proof strip */}
        <p className="text-xs text-muted-foreground">
          Next.js · Supabase · Jira REST API · Gemini AI
        </p>
      </section>

      <Separator />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything your team needs to ship smarter
            </h2>
            <p className="mt-3 text-muted-foreground">
              From raw sprint data to actionable AI insights in minutes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className={cn(
                    "transition-shadow duration-200 hover:shadow-md",
                  )}
                >
                  <CardHeader className="pb-0">
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg border bg-muted">
                      <Icon className="size-4 text-foreground" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Up and running in three steps
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-bold text-muted-foreground/40 tabular-nums">
                    {step.number}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="hidden h-px flex-1 bg-border sm:block" />
                  )}
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Meet the team
            </h2>
            <p className="mt-3 text-muted-foreground">
              The people who built Turtle.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className={cn(
                  "overflow-hidden p-0 text-center transition-shadow duration-200 hover:shadow-md",
                )}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="px-4 py-4">
                  <p className="text-base font-semibold">{member.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{member.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to understand your sprints?
          </h2>
          <p className="text-muted-foreground">
            Sign up, connect Jira and run your first AI analysis in under a
            minute.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              {t("landing.getStarted")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Turtle
          </p>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link href="/app" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
