import React from "react";
import { View } from "react-native";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { UiText } from "@/src/components/UiText";
import { useTheme } from "@/src/ui/useTheme";

export default function GamesScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, padding: t.spacing.lg }}>
      <ScreenHeader title="Jeux" subtitle="Memory, puzzle, quiz" />
      <UiText muted style={{ textAlign: "center" }}>Bientôt disponible</UiText>
    </View>
  );
}