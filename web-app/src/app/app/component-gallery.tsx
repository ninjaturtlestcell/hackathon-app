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
    </div>
  );
}
