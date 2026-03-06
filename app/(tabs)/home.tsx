import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
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
  pink:   "#f05c7e",
  white:  "#ffffff",
};

const DAYS = [
  { label: "LUN", subtitle: "Recette" },
  { label: "MAR", subtitle: "Exercice" },
  { label: "MER", subtitle: "Sortie" },
  { label: "JEU", subtitle: "Vidéo" },
  { label: "VEN", subtitle: "Événement" },
  { label: "SAM", subtitle: "Détente" },
  { label: "DIM", subtitle: "Famille" },
];
const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function HomeScreen() {
  const { profile, loaded } = useProfile();
  const seniorName = loaded && profile?.prenom ? profile.prenom : undefined;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── BANDEAU HEADER ── */}
        <View style={s.banner}>
          <Image
            source={require("../../assets/logo.png")}
            style={s.logoImg}
            resizeMode="contain"
          />
          <UiText style={s.bannerText}>Bienvenue dans Seniors Connect</UiText>
        </View>

        {/* ── TOP ROW ── */}
        <View style={s.topRow}>

          {/* COLONNE GAUCHE */}
          <View style={s.leftCol}>
            <View style={[s.meteoCard, { backgroundColor: C.blue }]}>
              <UiText style={s.meteoCity}>LYON</UiText>
              <UiText style={s.meteoTemp}>14°</UiText>
              <UiText style={s.meteoDesc}>Ensoleillé</UiText>
            </View>
            <View style={[s.newsCard, { backgroundColor: C.yellow }]}>
              <UiText style={s.newsLabel}>ACTUALITÉS</UiText>
              <UiText style={s.newsText}>
                La fête des voisins revient le 30 mai dans toute la France.
              </UiText>
              <UiText style={s.newsArrow}>→ Lire</UiText>
            </View>
          </View>

          {/* COLONNE DROITE — JEANNE */}
          <View style={s.jeanneCard}>
            <View style={s.jeanneHeader}>
              <UiText style={s.jeanneName}>JEANNE</UiText>
              <UiText style={s.jeanneSubtitle}>Votre assistante à domicile</UiText>
            </View>
            <View style={s.jeanneAvatar}>
              <LiveAvatarEmbed isSandbox={true} seniorName={seniorName} />
            </View>
            <View style={s.jeanneTextBlock}>
              <UiText style={s.jeanneGreeting}>
                Bonjour, je m'appelle Jeanne, je suis une intelligence artificielle.
              </UiText>
              <UiText style={s.jeanneCta}>Vous souhaitez discuter ? Appuyez sur le Chat now et séléctionner la langue pour parler.</UiText>
              <UiText style={s.jeanneDisclaimer}>
                Mes réponses peuvent contenir des erreurs.{"\n"}Pour toute urgence, appelez le 15 ou le 18.
              </UiText>
            </View>
          </View>
        </View>

        {/* ── AGENDA | CONTACTS ── */}
        <View style={[s.row, { marginBottom: 10 }]}>
          <TouchableOpacity style={[s.card, { backgroundColor: C.blue, flex: 1 }]} onPress={() => router.push("/(tabs)/agenda")} activeOpacity={0.82}>
            <UiText style={[s.cardTitle, { color: C.white }]}>AGENDA</UiText>
            <UiText style={[s.cardSub, { color: "rgba(255,255,255,0.75)" }]}>Kiné à 14h aujourd'hui</UiText>
            <UiText style={[s.cardArrow, { color: C.white }]}>{"→"}</UiText>
          </TouchableOpacity>
          <TouchableOpacity style={[s.card, { backgroundColor: C.yellow, flex: 1.32 }]} onPress={() => router.push("/(tabs)/comm")} activeOpacity={0.82}>
            <UiText style={[s.cardTitle, { color: C.black }]}>CONTACTS</UiText>
            <UiText style={[s.cardSub, { color: "rgba(0,0,0,0.6)" }]}>Famille & soignants</UiText>
            <UiText style={[s.cardArrow, { color: C.black }]}>{"→"}</UiText>
          </TouchableOpacity>
        </View>

        {/* ── JEUX | URGENCE ── */}
        <View style={[s.row, { marginBottom: 16 }]}>
          <TouchableOpacity style={[s.card, { backgroundColor: C.black, flex: 1 }]} onPress={() => router.push("/(tabs)/games")} activeOpacity={0.82}>
            <UiText style={[s.cardTitle, { color: C.white }]}>JEUX</UiText>
            <UiText style={[s.cardSub, { color: "rgba(255,255,255,0.6)" }]}>Memory, puzzle, quiz</UiText>
            <UiText style={[s.cardArrow, { color: C.yellow }]}>{"→"}</UiText>
          </TouchableOpacity>
          <TouchableOpacity style={[s.card, { backgroundColor: C.pink, flex: 1.32 }]} onPress={() => router.push("/(tabs)/emergency")} activeOpacity={0.82}>
            <UiText style={[s.cardTitle, { color: C.white }]}>URGENCE</UiText>
            <UiText style={[s.cardSub, { color: "rgba(255,255,255,0.75)" }]}>Télé-assistance</UiText>
            <UiText style={[s.cardArrow, { color: C.white }]}>{"→"}</UiText>
          </TouchableOpacity>
        </View>

        {/* ── CETTE SEMAINE — pleine largeur ── */}
        <UiText style={s.weekTitle}>CETTE SEMAINE</UiText>
        <View style={s.weekGrid}>
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
        </View>

      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 10, paddingBottom: 20 },

  // ── BANDEAU ──
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#3481f8",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  logoImg:    { width: 120, height: 70 },
  bannerText: { fontSize: 22, fontWeight: "900", color: "#ffffff", flex: 1, textAlign: "center" },

  // ── TOP ROW ──
  topRow:  { flexDirection: "row", gap: 10, marginBottom: 10 },
  leftCol: { flex: 1, gap: 10 },

  // Météo — "LYON" 14→16, desc 13→15
  meteoCard: { borderRadius: 16, padding: 16, flex: 1, minHeight: 120 },
  meteoCity: { fontSize: 16, fontWeight: "900", color: "rgba(255,255,255,0.85)", letterSpacing: 1 },
  meteoTemp: { fontSize: 42, fontWeight: "900", color: "#fff", lineHeight: 48 },
  meteoDesc: { fontSize: 15, color: "rgba(255,255,255,0.85)", marginTop: 2 },

  // Actualités — label 12→14, texte 13→15
  newsCard:  { borderRadius: 16, padding: 16, flex: 1.6 },
  newsLabel: { fontSize: 14, fontWeight: "900", color: "rgba(0,0,0,0.6)", letterSpacing: 1 },
  newsText:  { fontSize: 15, color: "#111", lineHeight: 22, marginTop: 8 },
  newsArrow: { fontSize: 15, fontWeight: "700", color: "#111", marginTop: 10 },

  // Jeanne — avatar +20px, textes +2
  jeanneCard:       { flex: 1.32, backgroundColor: "#111111", borderRadius: 20, overflow: "hidden" },
  jeanneHeader:     { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 7 },
  jeanneName:       { fontSize: 26, fontWeight: "900", color: "#ffce36", letterSpacing: 2 },
  jeanneSubtitle:   { fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 2 },
  jeanneAvatar:     { height: 282, backgroundColor: "#000" },
  jeanneTextBlock:  { paddingHorizontal: 16, paddingVertical: 14, gap: 5 },
  jeanneGreeting:   { fontSize: 18, fontWeight: "700", color: "#fff", lineHeight: 25 },
  jeanneCta:        { fontSize: 18, fontWeight: "700", color: "#ffce36", lineHeight: 25 },
  jeanneDisclaimer: { fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 20, marginTop: 5 },

  // Cards — titre 18→22, sous-titre 13→16, flèche 22→26
  row:       { flexDirection: "row", gap: 10 },
  card:      { flex: 1, borderRadius: 20, padding: 20, minHeight: 115, justifyContent: "space-between" },
  cardTitle: { fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  cardSub:   { fontSize: 15, marginTop: 6 },
  cardArrow: { fontSize: 26, fontWeight: "900", alignSelf: "flex-end" },

  // Semaine — titre 17→19, jours 13→15, sous-titres 10→12
  weekTitle:      { fontSize: 19, fontWeight: "900", color: "#111", marginBottom: 10, letterSpacing: 1 },
  weekGrid:       { flexDirection: "row", gap: 6 },
  dayChip:        { flex: 1, alignItems: "center", paddingVertical: 12, paddingHorizontal: 4, borderRadius: 14, backgroundColor: "#fff" },
  dayChipActive:  { backgroundColor: "#111" },
  dayLabel:       { fontSize: 15, fontWeight: "900", color: "#111" },
  dayLabelActive: { color: "#ffce36" },
  daySub:         { fontSize: 11, color: "#888", marginTop: 3, textAlign: "center" },
  daySubActive:   { color: "rgba(255,255,255,0.7)" },
});