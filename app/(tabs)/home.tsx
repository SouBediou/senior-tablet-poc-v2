import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

import { Screen } from "@/src/components/Screen";
import { UiText } from "@/src/components/UiText";
import { useProfile } from "@/src/hooks/useProfile";
import LiveAvatarEmbed from "@/src/components/LiveAvatarEmbed";

const C = {
  black:  "#111111",
  yellow: "#ffce36",
  blue:   "#3481f8",
  pink:   "#fdb6e7",
  white:  "#ffffff",
  muted:  "#888",
};

const DAYS = [
  { label: "Lun", subtitle: "Recette" },
  { label: "Mar", subtitle: "Exercice" },
  { label: "Mer", subtitle: "Sortie" },
  { label: "Jeu", subtitle: "Vidéo" },
  { label: "Ven", subtitle: "Événement" },
  { label: "Sam", subtitle: "Détente" },
  { label: "Dim", subtitle: "Famille" },
];
const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const { profile, loaded } = useProfile();
  const avatarHeight = height * 0.5;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* AVATAR — taille originale 50% */}
        <View style={[s.avatarContainer, { height: avatarHeight }]}>
          <LiveAvatarEmbed
            seniorName={loaded && profile?.prenom ? profile.prenom : undefined}
          />
        </View>

        {/* MÉTÉO + ACTUALITÉS */}
        <View style={[s.row, { marginBottom: 10 }]}>
          <View style={[s.infoCard, { backgroundColor: C.blue, flex: 1 }]}>
            <UiText style={[s.infoLabel, { color: "rgba(255,255,255,0.75)" }]}>Lyon</UiText>
            <UiText style={[s.infoTemp, { color: C.white }]}>14°</UiText>
            <UiText style={[s.infoSub, { color: "rgba(255,255,255,0.85)" }]}>Ensoleillé</UiText>
          </View>
          <View style={[s.infoCard, { backgroundColor: C.yellow, flex: 1.5 }]}>
            <UiText style={[s.infoLabel, { color: "rgba(0,0,0,0.55)" }]}>Actualités</UiText>
            <UiText style={s.newsText}>
              La fête des voisins revient le 30 mai dans toute la France.
            </UiText>
            <UiText style={[s.newsArrow, { color: C.black }]}>{"→ Lire"}</UiText>
          </View>
        </View>

        {/* AGENDA | CONTACTS */}
        <View style={[s.row, { marginBottom: 10 }]}>
          <TouchableOpacity
            style={[s.card, { backgroundColor: C.blue }]}
            onPress={() => router.push("/(tabs)/agenda")}
            activeOpacity={0.82}
          >
            <UiText style={[s.cardTitle, { color: C.white }]}>Agenda</UiText>
            <UiText style={[s.cardSub, { color: "rgba(255,255,255,0.75)" }]}>Kiné à 14h aujourd'hui</UiText>
            <UiText style={[s.cardArrow, { color: C.white }]}>{"→"}</UiText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.card, { backgroundColor: C.yellow }]}
            onPress={() => router.push("/(tabs)/comm")}
            activeOpacity={0.82}
          >
            <UiText style={[s.cardTitle, { color: C.black }]}>Contacts</UiText>
            <UiText style={[s.cardSub, { color: "rgba(0,0,0,0.6)" }]}>Famille & soignants</UiText>
            <UiText style={[s.cardArrow, { color: C.black }]}>{"→"}</UiText>
          </TouchableOpacity>
        </View>

        {/* JEUX | URGENCE */}
        <View style={[s.row, { marginBottom: 16 }]}>
          <TouchableOpacity
            style={[s.card, { backgroundColor: C.black }]}
            onPress={() => router.push("/(tabs)/games")}
            activeOpacity={0.82}
          >
            <UiText style={[s.cardTitle, { color: C.white }]}>Jeux</UiText>
            <UiText style={[s.cardSub, { color: "rgba(255,255,255,0.6)" }]}>Memory, puzzle, quiz</UiText>
            <UiText style={[s.cardArrow, { color: C.yellow }]}>{"→"}</UiText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.card, { backgroundColor: C.pink }]}
            onPress={() => router.push("/(tabs)/emergency")}
            activeOpacity={0.82}
          >
            <UiText style={[s.cardTitle, { color: C.black }]}>Urgence</UiText>
            <UiText style={[s.cardSub, { color: "rgba(0,0,0,0.6)" }]}>Télé-assistance</UiText>
            <UiText style={[s.cardArrow, { color: C.black }]}>{"→"}</UiText>
          </TouchableOpacity>
        </View>

        {/* CETTE SEMAINE */}
        <UiText style={s.weekTitle}>Cette semaine</UiText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.weekScroll}
        >
          {DAYS.map((day, i) => {
            const active = i === TODAY_INDEX;
            return (
              <TouchableOpacity
                key={day.label}
                style={[s.dayChip, active && s.dayChipActive]}
                onPress={() => {}}
              >
                <UiText style={[s.dayLabel, active && s.dayLabelActive]}>{day.label}</UiText>
                <UiText style={[s.daySub, active && s.daySubActive]}>{day.subtitle}</UiText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },

  avatarContainer: {
    backgroundColor: "#000",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 10,
  },

  infoCard: { borderRadius: 16, padding: 14 },
  infoLabel: { fontSize: 12, fontWeight: "700" },
  infoTemp: { fontSize: 34, fontWeight: "900", lineHeight: 40 },
  infoSub: { fontSize: 13, marginTop: 2 },
  newsText: { fontSize: 12, color: "#111", lineHeight: 18, marginTop: 4 },
  newsArrow: { fontSize: 12, fontWeight: "700", marginTop: 6 },

  card: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    minHeight: 100,
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 18, fontWeight: "900" },
  cardSub: { fontSize: 13, marginTop: 4 },
  cardArrow: { fontSize: 22, fontWeight: "900", alignSelf: "flex-end" },

  weekTitle: { fontSize: 17, fontWeight: "900", color: "#111", marginBottom: 10 },
  weekScroll: { flexDirection: "row", gap: 8, paddingBottom: 8 },
  dayChip: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    minWidth: 68,
  },
  dayChipActive: { backgroundColor: "#111" },
  dayLabel: { fontSize: 14, fontWeight: "800", color: "#111" },
  dayLabelActive: { color: "#ffce36" },
  daySub: { fontSize: 11, color: "#888", marginTop: 2 },
  daySubActive: { color: "rgba(255,255,255,0.7)" },
});