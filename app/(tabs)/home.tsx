import React from "react";
import {
  View,
  StyleSheet,
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
  const { profile, loaded } = useProfile();
  const seniorName = loaded && profile?.prenom ? profile.prenom : undefined;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── TOP ROW : Météo+Actu à gauche | Jeanne à droite ── */}
        <View style={s.topRow}>

          {/* COLONNE GAUCHE */}
          <View style={s.leftCol}>
            {/* MÉTÉO */}
            <View style={[s.meteoCard, { backgroundColor: C.blue }]}>
              <UiText style={s.meteoCity}>Lyon</UiText>
              <UiText style={s.meteoTemp}>14°</UiText>
              <UiText style={s.meteoDesc}>Ensoleillé</UiText>
            </View>

            {/* ACTUALITÉS */}
            <View style={[s.newsCard, { backgroundColor: C.yellow }]}>
              <UiText style={s.newsLabel}>Actualités</UiText>
              <UiText style={s.newsText}>
                La fête des voisins revient le 30 mai dans toute la France.
              </UiText>
              <UiText style={s.newsArrow}>→ Lire</UiText>
            </View>
          </View>

          {/* COLONNE DROITE — JEANNE */}
          <View style={s.jeanneCard}>
            {/* Header */}
            <View style={s.jeanneHeader}>
              <UiText style={s.jeanneName}>JEANNE</UiText>
              <UiText style={s.jeanneSubtitle}>→ Votre assistante à domicile</UiText>
            </View>

            {/* Avatar WebView */}
            <View style={s.jeanneAvatar}>
              <LiveAvatarEmbed isSandbox={true} seniorName={seniorName} />
            </View>

            {/* Bloc texte explicatif */}
            <View style={s.jeanneTextBlock}>
              <UiText style={s.jeanneGreeting}>
                Bonjour, je m'appelle Jeanne, je suis une intelligence artificielle.
              </UiText>
              <UiText style={s.jeanneCta}>Vous souhaitez discuter ?</UiText>
              <UiText style={s.jeanneCta}>Appuyez sur le micro pour parler.</UiText>
              <UiText style={s.jeanneDisclaimer}>
                ⚠ Mes réponses peuvent contenir des erreurs.{"\n"}Pour toute urgence, appelez le 15 ou le 18.
              </UiText>
            </View>
          </View>
        </View>

        {/* ── AGENDA | CONTACTS ── */}
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

        {/* ── JEUX | URGENCE ── */}
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

        {/* ── CETTE SEMAINE ── */}
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
  scroll: { padding: 10, paddingBottom: 20 },

  topRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  leftCol: { flex: 1, gap: 10 },

  meteoCard: { borderRadius: 16, padding: 16, flex: 1, minHeight: 110 },
  meteoCity: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.75)" },
  meteoTemp: { fontSize: 38, fontWeight: "900", color: "#fff", lineHeight: 44 },
  meteoDesc: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },

  newsCard:  { borderRadius: 16, padding: 14, flex: 1.6 },
  newsLabel: { fontSize: 12, fontWeight: "700", color: "rgba(0,0,0,0.55)" },
  newsText:  { fontSize: 13, color: "#111", lineHeight: 19, marginTop: 6 },
  newsArrow: { fontSize: 13, fontWeight: "700", color: "#111", marginTop: 8 },

  jeanneCard: {
    flex: 1.15,
    backgroundColor: "#111111",
    borderRadius: 20,
    overflow: "hidden",
  },
  jeanneHeader: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  jeanneName:   { fontSize: 18, fontWeight: "900", color: "#ffce36", letterSpacing: 1 },
  jeanneSubtitle: { fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 },
  jeanneAvatar:   { height: 190, backgroundColor: "#000" },
  jeanneTextBlock: { paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  jeanneGreeting: { fontSize: 12, fontWeight: "700", color: "#fff", lineHeight: 17 },
  jeanneCta:      { fontSize: 12, fontWeight: "700", color: "#ffce36", lineHeight: 17 },
  jeanneDisclaimer: { fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 14, marginTop: 4 },

  row:       { flexDirection: "row", gap: 10 },
  card:      { flex: 1, borderRadius: 20, padding: 18, minHeight: 100, justifyContent: "space-between" },
  cardTitle: { fontSize: 18, fontWeight: "900" },
  cardSub:   { fontSize: 13, marginTop: 4 },
  cardArrow: { fontSize: 22, fontWeight: "900", alignSelf: "flex-end" },

  weekTitle:      { fontSize: 17, fontWeight: "900", color: "#111", marginBottom: 10 },
  weekScroll:     { flexDirection: "row", gap: 8, paddingBottom: 8 },
  dayChip:        { alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "#fff", minWidth: 68 },
  dayChipActive:  { backgroundColor: "#111" },
  dayLabel:       { fontSize: 14, fontWeight: "800", color: "#111" },
  dayLabelActive: { color: "#ffce36" },
  daySub:         { fontSize: 11, color: "#888", marginTop: 2 },
  daySubActive:   { color: "rgba(255,255,255,0.7)" },
});