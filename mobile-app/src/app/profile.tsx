import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { ChevronLeft } from "lucide-react-native";
import { toast } from "sonner-native";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { useProfile, useUpdateProfile } from "@shared/lib";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile(supabase);
  const updateProfile = useUpdateProfile(supabase);
  const [fullName, setFullName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile?.full_name != null) setFullName(profile.full_name);
  }, [profile?.full_name]);

  async function onPickAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
    });
    if (res.canceled || !res.assets[0]?.base64) return;
    const asset = res.assets[0];
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const ext = asset.uri.split(".").pop()?.split("?")[0] ?? "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("files")
        .upload(path, decode(asset.base64!), {
          contentType: asset.mimeType ?? "image/jpeg",
          upsert: true,
        });
      if (error) throw error;
      const { data } = supabase.storage.from("files").getPublicUrl(path);
      await updateProfile.mutateAsync({ avatar_url: data.publicUrl });
      toast.success(t("profile.saved"));
    } catch {
      toast.error(t("profile.uploadError"));
    } finally {
      setUploading(false);
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 gap-6 p-5">
        <View className="flex-row items-center gap-2">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <Icon as={ChevronLeft} className="text-foreground" size={20} />
          </Button>
          <Text className="font-sans-bold text-2xl text-foreground">
            {t("profile.title")}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <View className="gap-6">
            <View className="flex-row items-center gap-4">
              <Avatar alt={t("profile.title")} className="size-16">
                {profile?.avatar_url ? (
                  <AvatarImage source={{ uri: profile.avatar_url }} />
                ) : null}
                <AvatarFallback>
                  <Text>{initials}</Text>
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                onPress={onPickAvatar}
                disabled={uploading}
              >
                <Text>{uploading ? "..." : t("profile.changeAvatar")}</Text>
              </Button>
            </View>

            <View className="gap-2">
              <Label>{t("profile.fullName")}</Label>
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder={t("profile.fullNamePlaceholder")}
              />
            </View>

            <Button onPress={onSave} disabled={updateProfile.isPending}>
              <Text>{updateProfile.isPending ? "..." : t("common.save")}</Text>
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
