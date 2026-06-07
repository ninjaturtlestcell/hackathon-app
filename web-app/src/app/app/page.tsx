import { createClient } from "@/lib/supabase/server";
import { ComponentGallery } from "./component-gallery";

export default async function AppHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Hos geldin 🎉</h1>
        <div className="max-w-sm rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Oturum acan kullanici</p>
          <p className="text-base font-medium">{user?.email ?? "-"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight">Component Gallery</h2>
        <p className="text-sm text-muted-foreground">
          Tasarim sisteminin bilesenleri ve variant&apos;lari.
        </p>
      </div>
      <ComponentGallery />
    </div>
  );
}
