import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screen } from "@/src/components/Screen";
import { UiText } from "@/src/components/UiText";
import { useTheme } from "@/src/ui/useTheme";
import { router } from "expo-router";
import { COMPANION_AVATARS, CompanionId, DEFAULT_COMPANION } from "@/src/companion/companionConfig";



const STORAGE_KEY = "companion.avatarId";

const OPTIONS: { id: CompanionId; label: string; desc: string }[] = [
  { id: "femme", label: "Jeanne", desc: "Calme et rassurante" },
  { id: "homme", label: "Paul", desc: "Stable et chaleureux" },
  { id: "dynamique", label: "Léo", desc: "Énergique et motivant" },
];


export default function AvatarScreen() {
  const t = useTheme();
  

  const [selected, setSelected] = useState<CompanionId>(DEFAULT_COMPANION);

  const s = useMemo(
    () =>
      StyleSheet.create({
        header: { gap: 8, marginBottom: t.spacing.lg, alignItems: "center" },
        grid: { gap: t.spacing.md },
        card: {
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.xl,
          padding: t.spacing.lg,
          borderWidth: 2,
          borderColor: t.colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing.lg,
          ...t.shadow.card,
        },
        cardSelected: { borderColor: t.colors.primary },
        avatar: { width: 72, height: 72, borderRadius: 36 },
        btn: {
          marginTop: t.spacing.lg,
          backgroundColor: t.colors.primary,
          borderRadius: t.radius.xl,
          paddingVertical: t.spacing.md,
          alignItems: "center",
          ...t.shadow.card,
        },
      }),
    [t]
  );

  async function save() {
    await AsyncStorage.setItem(STORAGE_KEY, selected);
    router.replace("/(tabs)/home");
  }
  

  return (
    <Screen>
      <View style={s.header}>
        <UiText variant="h1" style={{ fontWeight: "900", textAlign: "center" }}>
          Choisir mon avatar
        </UiText>
        <UiText muted style={{ textAlign: "center" }}>
          Vous pouvez changer plus tard.
        </UiText>
      </View>

      <View style={s.grid}>
        {OPTIONS.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => setSelected(o.id)}
            style={[s.card, selected === o.id && s.cardSelected]}
            accessibilityRole="button"
          >
            <Image source={COMPANION_AVATARS[o.id]} style={s.avatar} />
            <View style={{ flex: 1 }}>
              <UiText variant="title" style={{ fontWeight: "900" }}>
                {o.label}
              </UiText>
              <UiText muted>{o.desc}</UiText>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={save} style={s.btn} accessibilityRole="button">
        <UiText style={{ color: "#fff", fontWeight: "900" }}>Valider</UiText>
      </Pressable>
    </Screen>
  );
}
