import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/src/components/Screen";
import { useTheme } from "@/src/ui/useTheme";
import { CompanionHeader } from "@/src/components/CompanionHeader";
import { ActionCard } from "@/src/components/ActionCard";
import { UiText } from "@/src/components/UiText";
import { useCompanion } from "@/src/companion/useCompanion";



export default function HomeScreen() {
  const t = useTheme();
  const { avatarId } = useCompanion();
  const name =
    avatarId === "femme" ? "Jeanne" :
    avatarId === "homme" ? "Paul" :
    "Léo";

  const s = StyleSheet.create({
    section: {
      marginTop: t.spacing.lg,
      gap: t.spacing.md,
    },
    gridRow: {
      flexDirection: "row",
      gap: t.spacing.md,
    },
    col: {
      flex: 1,
    },
    companionCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.xl,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing.md,
      ...t.shadow.card,
    },
  });

  return (
    <Screen>
      {/* Header avec avatar */}
      <CompanionHeader 
      title={name} subtitle="Je suis là avec vous" />


      {/* Carte Avatar */}
      <View style={s.section}>
        <Pressable
          onPress={() => router.push("/avatar")}
          accessibilityRole="button"
          style={s.companionCard}
        >
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={t.colors.primary}
          />

          <View style={{ flex: 1 }}>
            <UiText variant="title" style={{ fontWeight: "900" }}>
            Avec qui voulez-vous parler ?
            </UiText>
            <UiText muted>Choisir ou changer l’avatar</UiText>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={t.colors.muted}

          />
        </Pressable>
      </View>

      {/* Action principale */}
      <View style={s.section}>
      <ActionCard
      title="Touchez pour parler"
      icon="mic-outline"
      tone="primary"
      onPress={() => router.push("/companion")}
    />

      </View>

      {/* Accès rapides */}
      <View style={s.section}>
        <UiText
          variant="small"
          style={{ fontWeight: "900", color: t.colors.muted }}
        >
          Accès rapide
        </UiText>

        <View style={s.gridRow}>
          <View style={s.col}>
          <ActionCard
        title="Contacts"
        subtitle="Famille & soignants"
        icon="people-outline"
        accessibilityLabel="Contacts"
        accessibilityHint="Appeler un proche ou un soignant"
        onPress={() => router.push("/contacts/quick-call")}
                  />
          </View>

          <View style={s.col}>
            <ActionCard
              title="Jeux"
              subtitle="Memory, puzzle, quiz"
              icon="game-controller-outline"
              onPress={() => router.push("/(tabs)/games")}
            />
          </View>
        </View>

        <View style={s.gridRow}>
          <View style={s.col}>
            <ActionCard
              title="Agenda"
              subtitle="Rappels & visites"
              icon="calendar-outline"
              onPress={() => router.push("/(tabs)/agenda")}
            />
          </View>

          <View style={s.col}>
            <ActionCard
              title="Urgence"
              subtitle="Télé-assistance"
              icon="alert-circle-outline"
              tone="danger"
              onPress={() => router.push("/(tabs)/emergency")}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

