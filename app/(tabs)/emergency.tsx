import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, Vibration } from "react-native";
import { Screen } from "@/src/components/Screen";
import { UiText } from "@/src/components/UiText";
import { useTheme } from "@/src/ui/useTheme";
import { router } from "expo-router";
import { ScreenHeader } from '@/src/components/ScreenHeader';

function BigEmergencyButton({ onPress }: { onPress: () => void }) {
  const t = useTheme();

  const s = useMemo(
    () =>
      StyleSheet.create({
        halo: {
          borderRadius: 999,
          padding: 18,
          backgroundColor: "rgba(229,72,77,0.12)",
          borderWidth: 1,
          borderColor: "rgba(229,72,77,0.25)",
        },
        outer: {
          borderRadius: 999,
          padding: 10,
          backgroundColor: "rgba(229,72,77,0.18)",
        },
        button: {
          borderRadius: 999,
          paddingVertical: 26,
          backgroundColor: t.colors.danger,
          alignItems: "center",
        },
      }),
    [t]
  );

  return (
    <Pressable
      onPress={() => {
        Vibration.vibrate(40);
        onPress();
      }}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
    >
      <View style={s.halo}>
        <View style={s.outer}>
          <View style={s.button}>
            <UiText variant="h1" style={{ color: "#fff", fontWeight: "900" }}>
              🚨 URGENCE
            </UiText>
            <UiText variant="small" style={{ color: "rgba(255,255,255,0.9)", marginTop: 6 }}>
              Appeler l’assistance
            </UiText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function EmergencyScreen() {
  const t = useTheme();
  const [status, setStatus] = useState<"idle" | "calling" | "done">("idle");

  const s = StyleSheet.create({
    header: { gap: 6, marginBottom: t.spacing.lg },
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.xl,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      ...t.shadow.card,
    },
  });

  const startCall = () => {
    setStatus("calling");
    setTimeout(() => setStatus("done"), 1500);
  };

  return (
    <Screen>
      <ScreenHeader title="Urgence" subtitle="En cas de malaise ou de chute, appuyez sur le bouton" />

      <View style={{ gap: t.spacing.lg }}>
        <BigEmergencyButton onPress={() => router.push("/emergency-confirm")} />

        <View style={s.card}>
          <UiText variant="title" style={{ fontWeight: "900" }}>
            {status === "idle" && "Prêt"}
            {status === "calling" && "📞 Appel en cours…"}
            {status === "done" && "✅ Assistance contactée"}
          </UiText>

          <UiText muted style={{ marginTop: 8 }}>
            {status === "idle" && "Vous pouvez prévenir l’assistance à tout moment."}
            {status === "calling" && "Restez calme, nous nous occupons de tout."}
            {status === "done" && "Restez près de la tablette."}
          </UiText>

          {status !== "idle" && (
            <Pressable
              onPress={() => setStatus("idle")}
              style={{ marginTop: 16 }}
            >
              <UiText muted>Réinitialiser (POC)</UiText>
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}
