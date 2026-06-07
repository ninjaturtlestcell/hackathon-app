"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { useProfile, useUpdateProfile } from "@shared/lib";

export default function ProfilePage() {
  const { t } = useTranslation();
  const supabase = useMemo(() => createClient(), []);
  const { data: profile, isLoading } = useProfile(supabase);
  const updateProfile = useUpdateProfile(supabase);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile?.full_name != null) setFullName(profile.full_name);
  }, [profile?.full_name]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("files")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("files").getPublicUrl(path);
      await updateProfile.mutateAsync({ avatar_url: data.publicUrl });
      toast.success(t("profile.saved"));
    } catch {
      toast.error(t("profile.uploadError"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSave() {
    await updateProfile.mutateAsync({ full_name: fullName });
    toast.success(t("profile.saved"));
  }

  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex max-w-sm flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="" />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "..." : t("profile.changeAvatar")}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onPickFile}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">{t("profile.fullName")}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("profile.fullNamePlaceholder")}
            />
          </div>

          <Button
            onClick={onSave}
            disabled={updateProfile.isPending}
            className="self-start"
          >
            {updateProfile.isPending ? "..." : t("common.save")}
          </Button>
        </div>
      )}
    </div>
  );
}
