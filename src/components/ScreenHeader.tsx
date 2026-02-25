import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/src/ui/useTheme";
import { UiText } from "./UiText";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const t = useTheme();

  const s = StyleSheet.create({
    container: {
      alignItems: "center",
      marginBottom: t.spacing.lg,
    },
    badge: {
      backgroundColor: "#a7aac9",
      borderRadius: t.radius.lg,
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.xl,
      marginBottom: subtitle ? t.spacing.sm : 0,
    },
    title: {
      fontWeight: "900",
      fontSize: 26,
      textAlign: "center",
      color: "#411C68",
    },
    subtitle: {
      textAlign: "center",
      color: t.colors.muted,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.badge}>
        <UiText style={s.title}>{title}</UiText>
      </View>
      {!!subtitle && (
        <UiText variant="small" style={s.subtitle}>
          {subtitle}
        </UiText>
      )}
    </View>
  );
}