import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import * as React from "react";
import { Platform, Text, View, type ViewProps } from "react-native";
import { SlideInDown, SlideOutDown, FadeIn, FadeOut } from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";

import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { cn } from "@shared/lib";

/**
 * Alttan acilan panel (bottom sheet). @rn-primitives/dialog uzerine kurulu —
 * mevcut PortalHost altyapisini kullanir, ekstra provider gerektirmez.
 * Gesture ile suruklenebilir bir versiyon icin @expo/ui bottom-sheet'e gecilebilir.
 */
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const FullWindowOverlay =
  Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

function SheetContent({
  className,
  portalHost,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalHost?: string;
}) {
  return (
    <DialogPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <DialogPrimitive.Overlay
          className="absolute bottom-0 left-0 right-0 top-0 justify-end bg-black/50"
          asChild={Platform.OS !== "web"}
        >
          <NativeOnlyAnimatedView
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
          >
            <NativeOnlyAnimatedView
              entering={SlideInDown.duration(250)}
              exiting={SlideOutDown.duration(200)}
            >
              <DialogPrimitive.Content
                className={cn(
                  "bg-background border-border w-full gap-4 rounded-t-2xl border-x border-t p-6 pb-8 shadow-lg shadow-black/10",
                  className,
                )}
                {...props}
              >
                <>{children}</>
                <DialogPrimitive.Close
                  className="absolute right-4 top-4 rounded opacity-70 active:opacity-100"
                  hitSlop={12}
                >
                  <Icon as={X} className="text-foreground size-5 shrink-0" />
                  <Text className="sr-only">Close</Text>
                </DialogPrimitive.Close>
              </DialogPrimitive.Content>
            </NativeOnlyAnimatedView>
          </NativeOnlyAnimatedView>
        </DialogPrimitive.Overlay>
      </FullWindowOverlay>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: ViewProps) {
  return <View className={cn("gap-1.5", className)} {...props} />;
}

function SheetFooter({ className, ...props }: ViewProps) {
  return <View className={cn("mt-2 gap-2", className)} {...props} />;
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-foreground text-lg font-sans-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
