import React from "react";
import { Pressable, View, StyleSheet, type PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/ui/useTheme";
import { UiText } from "./UiText";

type ActionCardBaseProps = {
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tone?: "default" | "primary" | "danger";
  color?: string;
  onPress?: () => void;
};

type ActionCardProps = ActionCardBaseProps & Omit<PressableProps, "onPress">;

export function ActionCard({
  title,
  subtitle,
  icon,
  tone = "default",
  color,
  onPress,
  style,
  ...pressableProps
}: ActionCardProps) {
  const t = useTheme();

  const isDark = tone === "primary";
  const isDanger = tone === "danger";

  const bg = color ?? (isDark ? t.colors.ink : isDanger ? "#eaeaf7" : t.colors.surface);
const textColor = isDark ? "#FFFFFF" : t.colors.text;
const subtitleColor = isDark ? "rgba(255,255,255,0.7)" : t.colors.muted;
const arrowColor = isDark ? "rgba(255,255,255,0.5)" : t.colors.muted;

  const s = StyleSheet.create({
    card: {
      borderRadius: t.radius.xl,
      padding: t.spacing.md,
      backgroundColor: bg,
      ...t.shadow.card,
  
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: t.spacing.md,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDark || isDanger ? "rgba(255,255,255,0.15)" : "rgba(65,28,104,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },
    arrow: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark || isDanger ? "rgba(255,255,255,0.1)" : "rgba(65,28,104,0.06)",
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      {...pressableProps}
      style={({ pressed }) => {
        const base = { transform: [{ scale: pressed ? 0.97 : 1 }] };
        const extra = typeof style === "function" ? style({ pressed }) : style;
        return [base, extra];
      }}
    >
      <View style={s.card}>
        <View style={s.topRow}>
          
          <View style={s.arrow}>
            <Ionicons name="arrow-forward" size={16} color={arrowColor} />
          </View>
        </View>

        <UiText variant="title" style={{ color: textColor, fontWeight: "900" }}>
          {title}
        </UiText>

        {!!subtitle && (
          <UiText variant="small" style={{ color: subtitleColor, marginTop: 4 }}>
            {subtitle}
          </UiText>
        )}
      </View>
    </Pressable>
  );
}