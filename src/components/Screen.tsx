import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { useTheme } from "@/src/ui/useTheme";

export function Screen({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.colors.bg },
    content: { flex: 1, padding: t.spacing.lg },
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>{children}</View>
    </SafeAreaView>
  );
}
