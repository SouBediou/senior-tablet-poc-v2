import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { UiText } from "@/src/components/UiText";

const C = { black: "#111111", yellow: "#ffce36", blue: "#3481f8", pink: "#f05c7e", white: "#ffffff" };

const GAMES = [
  { emoji: "🧠", title: "Memory", desc: "Retrouvez les paires de cartes", color: C.blue, available: false },
  { emoji: "🧩", title: "Puzzle", desc: "Reconstituez l'image", color: C.yellow, available: false },
  { emoji: "❓", title: "Quiz", desc: "Testez votre culture générale", color: C.black, available: false },
  { emoji: "🔤", title: "Mots croisés", desc: "Jouez avec les mots", color: C.pink, available: false },
];

export default function GamesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ backgroundColor: C.black, paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 }}>
        <UiText style={{ fontSize: 32, fontWeight: "900", color: C.yellow }}>Jeux</UiText>
        <UiText style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
          Memory, puzzle, quiz et plus
        </UiText>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        {GAMES.map((g) => (
          <TouchableOpacity
            key={g.title}
            activeOpacity={0.75}
            style={{
              backgroundColor: g.color,
              borderRadius: 22,
              padding: 24,
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
              opacity: g.available ? 1 : 0.75,
            }}
          >
            <UiText style={{ fontSize: 48 }}>{g.emoji}</UiText>
            <View style={{ flex: 1 }}>
              <UiText style={{
                fontSize: 24,
                fontWeight: "900",
                color: g.color === C.yellow || g.color === C.pink ? C.black : C.white,
              }}>{g.title}</UiText>
              <UiText style={{
                fontSize: 16,
                marginTop: 4,
                color: g.color === C.yellow || g.color === C.pink
                  ? "rgba(0,0,0,0.6)"
                  : "rgba(255,255,255,0.65)",
              }}>{g.desc}</UiText>
              {!g.available && (
                <UiText style={{
                  fontSize: 13,
                  marginTop: 8,
                  fontWeight: "700",
                  color: g.color === C.yellow || g.color === C.pink
                    ? "rgba(0,0,0,0.4)"
                    : "rgba(255,255,255,0.4)",
                }}>Bientôt disponible</UiText>
              )}
            </View>
            <UiText style={{
              fontSize: 28,
              fontWeight: "900",
              color: g.color === C.yellow || g.color === C.pink ? C.black : C.yellow,
            }}>→</UiText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}