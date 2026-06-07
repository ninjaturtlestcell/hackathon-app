import { ComponentGallery } from "../component-gallery";

export default function ComponentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Components</h1>
        <p className="text-sm text-muted-foreground">
          Tasarim sisteminin bilesenleri ve variant&apos;lari.
        </p>
      </div>
      <ComponentGallery />
    </div>
  );
}
