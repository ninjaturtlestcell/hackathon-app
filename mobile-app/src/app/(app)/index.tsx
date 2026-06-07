import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  type Option,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth";
import { Inbox, Terminal } from "lucide-react-native";
import { toast } from "sonner-native";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3 border-t border-border py-5">
      <Text className="font-sans-bold text-base text-foreground">{title}</Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row flex-wrap items-center gap-3">{children}</View>
  );
}

function Cap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="items-start gap-1">
      <Text className="font-sans text-xs text-muted-foreground">{label}</Text>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const form = useForm<{ sample: string }>({ defaultValues: { sample: "" } });

  const [checked, setChecked] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [radio, setRadio] = useState("a");
  const [fruit, setFruit] = useState<Option | undefined>(undefined);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-2 p-5 pb-16">
        <View className="flex-row items-center justify-between gap-3">
          <View className="shrink">
            <Text className="font-sans-bold text-2xl text-foreground">
              Component Gallery
            </Text>
            <Text className="font-sans text-sm text-muted-foreground">
              {user?.email ?? "-"}
            </Text>
          </View>
          <Button variant="outline" size="sm" onPress={signOut}>
            <Text>Cikis</Text>
          </Button>
        </View>

        <Section title="Button — variant">
          <Row>
            <Cap label="default">
              <Button>
                <Text>Default</Text>
              </Button>
            </Cap>
            <Cap label="secondary">
              <Button variant="secondary">
                <Text>Secondary</Text>
              </Button>
            </Cap>
            <Cap label="outline">
              <Button variant="outline">
                <Text>Outline</Text>
              </Button>
            </Cap>
          </Row>
          <Row>
            <Cap label="destructive">
              <Button variant="destructive">
                <Text>Destructive</Text>
              </Button>
            </Cap>
            <Cap label="ghost">
              <Button variant="ghost">
                <Text>Ghost</Text>
              </Button>
            </Cap>
            <Cap label="link">
              <Button variant="link">
                <Text>Link</Text>
              </Button>
            </Cap>
          </Row>
        </Section>

        <Section title="Button — size">
          <Row>
            <Cap label="sm">
              <Button size="sm">
                <Text>Small</Text>
              </Button>
            </Cap>
            <Cap label="default">
              <Button size="default">
                <Text>Default</Text>
              </Button>
            </Cap>
            <Cap label="lg">
              <Button size="lg">
                <Text>Large</Text>
              </Button>
            </Cap>
            <Cap label="disabled">
              <Button disabled>
                <Text>Disabled</Text>
              </Button>
            </Cap>
          </Row>
        </Section>

        <Section title="Input">
          <Cap label="default">
            <Input placeholder="Placeholder" />
          </Cap>
          <Cap label="disabled">
            <Input placeholder="Disabled" editable={false} />
          </Cap>
        </Section>

        <Section title="Textarea">
          <Cap label="default">
            <Textarea placeholder="Type here..." />
          </Cap>
        </Section>

        <Section title="Checkbox">
          <Row>
            <Cap label="interactive">
              <Checkbox checked={checked} onCheckedChange={setChecked} />
            </Cap>
            <Cap label="checked">
              <Checkbox checked onCheckedChange={() => {}} />
            </Cap>
            <Cap label="disabled">
              <Checkbox checked={false} onCheckedChange={() => {}} disabled />
            </Cap>
            <Cap label="with label">
              <View className="flex-row items-center gap-2">
                <Checkbox checked={checked} onCheckedChange={setChecked} />
                <Label>Accept</Label>
              </View>
            </Cap>
          </Row>
        </Section>

        <Section title="Radio Group">
          <RadioGroup value={radio} onValueChange={setRadio}>
            <View className="flex-row items-center gap-2">
              <RadioGroupItem value="a" />
              <Label onPress={() => setRadio("a")}>Option A</Label>
            </View>
            <View className="flex-row items-center gap-2">
              <RadioGroupItem value="b" />
              <Label onPress={() => setRadio("b")}>Option B</Label>
            </View>
            <View className="flex-row items-center gap-2">
              <RadioGroupItem value="c" disabled />
              <Label disabled>Option C (disabled)</Label>
            </View>
          </RadioGroup>
        </Section>

        <Section title="Switch">
          <Row>
            <Cap label="interactive">
              <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
            </Cap>
            <Cap label="on">
              <Switch checked onCheckedChange={() => {}} />
            </Cap>
            <Cap label="disabled">
              <Switch checked={false} onCheckedChange={() => {}} disabled />
            </Cap>
          </Row>
        </Section>

        <Section title="Select">
          <Cap label="default">
            <Select value={fruit} onValueChange={setFruit}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Pick a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem label="Apple" value="apple" />
                <SelectItem label="Banana" value="banana" />
                <SelectItem label="Cherry" value="cherry" />
              </SelectContent>
            </Select>
          </Cap>
        </Section>

        <Section title="Field (label + control + error)">
          <Field
            control={form.control}
            name="sample"
            label="Email"
            description="We never share it."
          >
            {({ field, fieldState }) => (
              <Input
                placeholder="ornek@eposta.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!fieldState.error}
              />
            )}
          </Field>
        </Section>

        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Text>Open dialog</Text>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog title</DialogTitle>
                <DialogDescription>Bu bir dialog ornegidir.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>
                    <Text>Tamam</Text>
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        <Section title="Alert Dialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Text>Sil</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu islem geri alinamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Vazgec</Text>
                </AlertDialogCancel>
                <AlertDialogAction>
                  <Text>Sil</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>

        <Section title="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Text>Open sheet</Text>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet title</SheetTitle>
                <SheetDescription>Alttan acilan panel.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Section>

        <Section title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Text>Menu</Text>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Hesap</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Text>Profil</Text>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Text>Ayarlar</Text>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <Text>Cikis</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Text>Popover</Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Text>Popover icerigi burada.</Text>
            </PopoverContent>
          </Popover>
        </Section>

        <Section title="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">
                <Text>Bas / tut</Text>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Text>Tooltip metni</Text>
            </TooltipContent>
          </Tooltip>
        </Section>

        <Section title="Toast">
          <Row>
            <Cap label="default">
              <Button variant="outline" onPress={() => toast("Kaydedildi")}>
                <Text>Toast</Text>
              </Button>
            </Cap>
            <Cap label="success">
              <Button
                variant="outline"
                onPress={() => toast.success("Basarili")}
              >
                <Text>Success</Text>
              </Button>
            </Cap>
            <Cap label="error">
              <Button
                variant="outline"
                onPress={() => toast.error("Hata olustu")}
              >
                <Text>Error</Text>
              </Button>
            </Cap>
          </Row>
        </Section>

        <Section title="Alert">
          <Alert icon={Terminal}>
            <AlertTitle>Bilgi</AlertTitle>
            <AlertDescription>
              Bu bir bilgilendirme uyarisidir.
            </AlertDescription>
          </Alert>
          <Alert icon={Terminal} variant="destructive">
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>Bir seyler ters gitti.</AlertDescription>
          </Alert>
        </Section>

        <Section title="Spinner">
          <Row>
            <Spinner />
            <Spinner size={24} />
            <Spinner size={32} className="text-primary" />
          </Row>
        </Section>

        <Section title="Skeleton">
          <View className="flex-row items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <View className="gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </View>
          </View>
        </Section>

        <Section title="Empty State">
          <EmptyState
            icon={Inbox}
            title="Henuz kayit yok"
            description="Ilk kaydini olusturarak basla."
            action={
              <Button size="sm">
                <Text>Olustur</Text>
              </Button>
            }
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
