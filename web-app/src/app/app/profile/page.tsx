import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getJiraSession } from "@/lib/jira/session";

export default async function ProfilePage() {
  const session = await getJiraSession();
  const user = session?.user;
  const initials = (user?.displayName ?? user?.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">Jira hesap bilgileriniz</p>
      </div>

      <div className="flex max-w-sm flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {user?.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{user?.displayName}</span>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
