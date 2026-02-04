import React from "react";
import {
  Pressable,
  View,
  StyleSheet,
  type PressableProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/ui/useTheme";
import { UiText } from "./UiText";

type ActionCardBaseProps = {
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tone?: "default" | "primary" | "danger";
  onPress?: () => void;
};

type ActionCardProps = ActionCardBaseProps & Omit<PressableProps, "onPress">;

export function ActionCard({
  title,
  subtitle,
  icon,
  tone = "default",
  onPress,
  style,
  ...pressableProps
}: ActionCardProps) {
  const t = useTheme();

  const bg =
    tone === "primary" ? "#FFFFFF" : tone === "danger" ? "#FFFFFF" : "#F2F2F2";

  const iconColor = tone === "danger" ? t.colors.danger : t.colors.primary;

  const s = StyleSheet.create({
    card: {
      borderRadius: t.radius.xl,
      padding: t.spacing.lg,
      backgroundColor: bg,
      borderWidth: 1,
      borderColor: t.colors.border,
      ...t.shadow.card,
    },
    row: { flexDirection: "row", alignItems: "center", gap: t.spacing.md },
    left: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(65, 28, 104, 0.08)",
      alignItems: "center",
      justifyContent: "center",
    },
    mid: { flex: 1 },
    chevronPill: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(65, 28, 104, 0.06)",
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
        const base = { transform: [{ scale: pressed ? 0.985 : 1 }] };

        // On gère style si tu passes:
        // - un objet/array de styles
        // - une fonction style Pressable
        const extra =
          typeof style === "function" ? style({ pressed }) : style;

        return [base, extra];
      }}
    >
      <View style={s.card}>
        <View style={s.row}>
          <View style={s.left}>
            <Ionicons name={icon} size={26} color={iconColor} />
          </View>

          <View style={s.mid}>
            <UiText
              variant="title"
              style={{ color: t.colors.text, fontWeight: "900" }}
            >
              {title}
            </UiText>

            {!!subtitle && (
              <UiText
                variant="small"
                style={{ color: t.colors.muted, marginTop: 4 }}
              >
                {subtitle}
              </UiText>
            )}
          </View>

          <View style={s.chevronPill}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={t.colors.muted}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
