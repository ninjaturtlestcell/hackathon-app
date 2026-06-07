"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpDown,
  DollarSign,
  Inbox,
  Terminal,
  Users,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { StatCard } from "@/components/ui/stat-card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const revenueData = [
  { month: "Oca", value: 1200 },
  { month: "Sub", value: 2100 },
  { month: "Mar", value: 1800 },
  { month: "Nis", value: 2600 },
  { month: "May", value: 2400 },
  { month: "Haz", value: 3200 },
];

const revenueChartConfig = {
  value: { label: "Gelir", color: "var(--primary)" },
} satisfies ChartConfig;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DataTable } from "@/components/ui/data-table";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

type Person = {
  id: string;
  name: string;
  email: string;
  status: "active" | "invited";
};

const people: Person[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", status: "active" },
  { id: "2", name: "Alan Turing", email: "alan@example.com", status: "active" },
  { id: "3", name: "Grace Hopper", email: "grace@example.com", status: "invited" },
  { id: "4", name: "Linus T.", email: "linus@example.com", status: "active" },
  { id: "5", name: "Margaret H.", email: "margaret@example.com", status: "invited" },
  { id: "6", name: "Dennis R.", email: "dennis@example.com", status: "active" },
];

const peopleColumns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t py-6 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

function Variant({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function ComponentGallery() {
  const form = useForm<{ sample: string }>({ defaultValues: { sample: "" } });
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <Section title="Button — variant">
        <Variant label="default">
          <Button>Default</Button>
        </Variant>
        <Variant label="secondary">
          <Button variant="secondary">Secondary</Button>
        </Variant>
        <Variant label="destructive">
          <Button variant="destructive">Destructive</Button>
        </Variant>
        <Variant label="outline">
          <Button variant="outline">Outline</Button>
        </Variant>
        <Variant label="ghost">
          <Button variant="ghost">Ghost</Button>
        </Variant>
        <Variant label="link">
          <Button variant="link">Link</Button>
        </Variant>
      </Section>

      <Section title="Button — size">
        <Variant label="sm">
          <Button size="sm">Small</Button>
        </Variant>
        <Variant label="default">
          <Button size="default">Default</Button>
        </Variant>
        <Variant label="lg">
          <Button size="lg">Large</Button>
        </Variant>
        <Variant label="disabled">
          <Button disabled>Disabled</Button>
        </Variant>
      </Section>

      <Section title="Input">
        <Variant label="default">
          <Input placeholder="Placeholder" className="w-56" />
        </Variant>
        <Variant label="disabled">
          <Input placeholder="Disabled" disabled className="w-56" />
        </Variant>
        <Variant label="invalid">
          <Input placeholder="Invalid" aria-invalid className="w-56" />
        </Variant>
      </Section>

      <Section title="Textarea">
        <Variant label="default">
          <Textarea placeholder="Type here..." className="w-56" />
        </Variant>
        <Variant label="disabled">
          <Textarea placeholder="Disabled" disabled className="w-56" />
        </Variant>
      </Section>

      <Section title="Checkbox">
        <Variant label="unchecked">
          <Checkbox />
        </Variant>
        <Variant label="checked">
          <Checkbox defaultChecked />
        </Variant>
        <Variant label="disabled">
          <Checkbox disabled />
        </Variant>
        <Variant label="with label">
          <div className="flex items-center gap-2">
            <Checkbox id="cb-terms" defaultChecked />
            <Label htmlFor="cb-terms">Accept terms</Label>
          </div>
        </Variant>
      </Section>

      <Section title="Radio Group">
        <Variant label="default">
          <RadioGroup defaultValue="a" className="gap-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="a" id="r-a" />
              <Label htmlFor="r-a">Option A</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="b" id="r-b" />
              <Label htmlFor="r-b">Option B</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="c" id="r-c" disabled />
              <Label htmlFor="r-c">Option C (disabled)</Label>
            </div>
          </RadioGroup>
        </Variant>
      </Section>

      <Section title="Switch">
        <Variant label="off">
          <Switch />
        </Variant>
        <Variant label="on">
          <Switch defaultChecked />
        </Variant>
        <Variant label="disabled">
          <Switch disabled />
        </Variant>
      </Section>

      <Section title="Select">
        <Variant label="default">
          <Select>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Pick a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
            </SelectContent>
          </Select>
        </Variant>
      </Section>

      <Section title="Field (label + control + error)">
        <Variant label="labeled input">
          <Field
            control={form.control}
            name="sample"
            label="Email"
            description="We never share it."
            className="w-56"
          >
            {({ field, fieldState, id }) => (
              <Input
                id={id}
                placeholder="ornek@eposta.com"
                aria-invalid={!!fieldState.error}
                {...field}
              />
            )}
          </Field>
        </Variant>
      </Section>

      <Section title="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>Bu bir dialog ornegidir.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>Tamam</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Alert Dialog">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Sil</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Emin misin?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu islem geri alinamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Vazgec</AlertDialogCancel>
              <AlertDialogAction>Sil</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>

      <Section title="Sheet">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet title</SheetTitle>
              <SheetDescription>Kenardan acilan panel.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </Section>

      <Section title="Dropdown Menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Hesap</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Ayarlar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Cikis
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="Popover">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Popover</Button>
          </PopoverTrigger>
          <PopoverContent>Popover icerigi burada.</PopoverContent>
        </Popover>
      </Section>

      <Section title="Tooltip">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip metni</TooltipContent>
        </Tooltip>
      </Section>

      <Section title="Toast">
        <Variant label="default">
          <Button variant="outline" onClick={() => toast("Kaydedildi")}>
            Toast
          </Button>
        </Variant>
        <Variant label="success">
          <Button
            variant="outline"
            onClick={() => toast.success("Basarili")}
          >
            Success
          </Button>
        </Variant>
        <Variant label="error">
          <Button variant="outline" onClick={() => toast.error("Hata olustu")}>
            Error
          </Button>
        </Variant>
      </Section>

      <Section title="Alert">
        <Variant label="default">
          <Alert className="max-w-md">
            <Terminal />
            <AlertTitle>Bilgi</AlertTitle>
            <AlertDescription>
              Bu bir bilgilendirme uyarisidir.
            </AlertDescription>
          </Alert>
        </Variant>
        <Variant label="destructive">
          <Alert variant="destructive" className="max-w-md">
            <Terminal />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>Bir seyler ters gitti.</AlertDescription>
          </Alert>
        </Variant>
      </Section>

      <Section title="Spinner">
        <Spinner />
        <Spinner className="size-6" />
        <Spinner className="size-8 text-primary" />
      </Section>

      <Section title="Skeleton">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </Section>

      <Section title="Empty State">
        <EmptyState
          icon={Inbox}
          title="Henuz kayit yok"
          description="Ilk kaydini olusturarak basla."
          action={<Button size="sm">Olustur</Button>}
          className="w-full max-w-md"
        />
      </Section>

      <Section title="Card">
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Card aciklamasi burada.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kart govde icerigi.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Aksiyon</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Badge">
        <Variant label="default">
          <Badge>Default</Badge>
        </Variant>
        <Variant label="secondary">
          <Badge variant="secondary">Secondary</Badge>
        </Variant>
        <Variant label="destructive">
          <Badge variant="destructive">Destructive</Badge>
        </Variant>
        <Variant label="outline">
          <Badge variant="outline">Outline</Badge>
        </Variant>
      </Section>

      <Section title="Avatar">
        <Variant label="image">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Variant>
        <Variant label="fallback">
          <Avatar>
            <AvatarFallback>TR</AvatarFallback>
          </Avatar>
        </Variant>
      </Section>

      <Section title="Accordion">
        <Accordion type="single" collapsible className="w-72">
          <AccordionItem value="a">
            <AccordionTrigger>Birinci soru?</AccordionTrigger>
            <AccordionContent>Birinci cevap.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Ikinci soru?</AccordionTrigger>
            <AccordionContent>Ikinci cevap.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="account" className="w-72">
          <TabsList>
            <TabsTrigger value="account">Hesap</TabsTrigger>
            <TabsTrigger value="password">Sifre</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="text-sm text-muted-foreground">
            Hesap ayarlari.
          </TabsContent>
          <TabsContent
            value="password"
            className="text-sm text-muted-foreground"
          >
            Sifre ayarlari.
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Progress">
        <div className="flex w-72 flex-col gap-3">
          <Progress value={30} />
          <Progress value={66} />
        </div>
      </Section>

      <Section title="Separator">
        <div className="flex w-72 flex-col gap-3">
          <span className="text-sm">Ust</span>
          <Separator />
          <span className="text-sm">Alt</span>
        </div>
      </Section>

      <Section title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/app">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/app">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gallery</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      <Section title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Section>

      <Section title="DataTable (sortable + pagination)">
        <DataTable columns={peopleColumns} data={people} />
      </Section>

      <Section title={t("demo.title")}>
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm">{t("demo.greeting")}</p>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </Section>

      <Section title="Stat Cards">
        <StatCard
          title="Gelir"
          value="$12.4k"
          delta={{ label: "+12% bu ay", positive: true }}
          icon={DollarSign}
          className="max-w-xs"
        />
        <StatCard
          title="Kullanici"
          value="1,240"
          delta={{ label: "+3.1%", positive: true }}
          icon={Users}
          className="max-w-xs"
        />
        <StatCard
          title="Aktif"
          value="312"
          delta={{ label: "-1.2%", positive: false }}
          icon={Activity}
          className="max-w-xs"
        />
      </Section>

      <Section title="Chart (area)">
        <ChartContainer
          config={revenueChartConfig}
          className="h-48 w-full max-w-lg"
        >
          <AreaChart data={revenueData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="value"
              type="natural"
              fill="var(--color-value)"
              fillOpacity={0.3}
              stroke="var(--color-value)"
            />
          </AreaChart>
        </ChartContainer>
      </Section>

      <Section title="Date Range Picker">
        <DateRangePicker />
      </Section>
    </div>
  );
}
