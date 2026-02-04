import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UiText } from "@/src/components/UiText";
import { useTheme } from "@/src/ui/useTheme";
import { COMPANION_AVATARS } from "@/src/companion/companionConfig";

export function CompanionHeader({
  title = "Bonjour",
  subtitle = "Je suis là avec vous",
}: {
  title?: string;
  subtitle?: string;
}) {
  const t = useTheme();
  const [avatarId, setAvatarId] = React.useState<"femme" | "homme" | "dynamique">("femme");

  // Recharge l’avatar à chaque retour écran (robuste)
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      AsyncStorage.getItem("companion.avatarId").then((value) => {
        if (!mounted) return;
        if (value === "femme" || value === "homme" || value === "dynamique") {
          setAvatarId(value);
        } else {
          setAvatarId("femme");
        }
      });

      return () => {
        mounted = false;
      };
    }, [])
  );

  const s = StyleSheet.create({
    wrap: {
      alignItems: "center",
      marginBottom: t.spacing.xl,
    },

    avatarWrap: {
      width: 140,
      height: 140,
      borderRadius: 70,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.surface,
      borderWidth: 3,
      borderColor: t.colors.primary, // liseré turquoise premium
      ...t.shadow.card,
    },

    avatar: {
      width: 125,
      height: 125,
      borderRadius: 62,
    },

    bubble: {
      marginTop: t.spacing.md,
      backgroundColor: "#f5ce5d", 
      borderRadius: t.radius.lg,
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.lg,
      borderWidth: 0,             
      maxWidth: "92%",
    },
    

    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: t.spacing.sm,
      gap: 8,
    },

    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: t.colors.success, // petit point rassurant
    },
  });

  return (
    <View style={s.wrap}>
      {/* Avatar avec liseré premium */}
      <View style={s.avatarWrap}>
        <Image
          source={COMPANION_AVATARS[avatarId]}
          style={s.avatar}
          accessibilityLabel="Avatar"
        />
      </View>

      {/* Bulle de message */}
      <View style={s.bubble}>
        <UiText variant="h1" style={{ fontWeight: "900", textAlign: "center" }}>
          {title}
        </UiText>

        <UiText muted style={{ textAlign: "center", marginTop: 4 }}>
          {subtitle}
        </UiText>
      </View>

      {/* Mini statut (effet waouh discret) */}
      <View style={s.statusRow}>
        <View style={s.statusDot} />
        <UiText variant="small" muted>
          En ligne
        </UiText>
      </View>
    </View>
  );
}
