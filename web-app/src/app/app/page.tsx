import { createClient } from "@/lib/supabase/server";

export default async function AppHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Hos geldin 🎉</h1>
      <div className="max-w-sm rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Oturum acan kullanici</p>
        <p className="text-base font-medium">{user?.email ?? "-"}</p>
      </div>
      <p className="text-muted-foreground">
        Ana uygulama buradan baslar. Tum <code>/app/*</code> route&apos;lari
        oturum gerektirir.
      </p>
    </div>
  );
}
