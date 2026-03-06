import React, { useState } from "react";
import { View, Pressable, Vibration } from "react-native";
import { router } from "expo-router";
import { UiText } from "@/src/components/UiText";

const C = { blue: "#3481f8", yellow: "#ffce36", black: "#111111", white: "#ffffff", red: "#E5484D", pink: "#f05c7e" };

export default function EmergencyScreen() {
  const [status, setStatus] = useState<"idle" | "calling" | "done">("idle");

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header rose */}
      <View style={{ backgroundColor: C.pink, paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 }}>
        <UiText style={{ fontSize: 32, fontWeight: "900", color: C.black }}>Urgence</UiText>
        <UiText style={{ fontSize: 17, color: "rgba(0,0,0,0.55)", marginTop: 4 }}>
          En cas de malaise ou de chute
        </UiText>
      </View>

      <View style={{ flex: 1, padding: 20, gap: 20, justifyContent: "space-between" }}>

        {/* Grand bouton urgence */}
        <Pressable
          onPress={() => { Vibration.vibrate(40); router.push("/emergency-confirm"); }}
          style={({ pressed }) => [{
            backgroundColor: C.red,
            borderRadius: 28,
            padding: 40,
            alignItems: "center",
            gap: 12,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            shadowColor: C.red,
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 8,
          }]}
        >
          <UiText style={{ fontSize: 64 }}>🚨</UiText>
          <UiText style={{ fontSize: 36, fontWeight: "900", color: C.white }}>URGENCE</UiText>
          <UiText style={{ fontSize: 18, color: "rgba(255,255,255,0.85)" }}>
            Appuyer pour appeler l'assistance
          </UiText>
        </Pressable>

        {/* Numéros utiles */}
        <View style={{ gap: 12 }}>
          <UiText style={{ fontSize: 20, fontWeight: "900", color: C.black, marginBottom: 4 }}>
            Numéros d'urgence
          </UiText>
          {[
            { num: "15", label: "SAMU — Urgences médicales", color: C.red },
            { num: "18", label: "Pompiers — Accident / incendie", color: C.blue },
            { num: "15", label: "Télé-assistance personnelle", color: C.black },
          ].map((item, i) => (
            <View key={i} style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <View style={{
                width: 60, height: 60, borderRadius: 16,
                backgroundColor: item.color,
                alignItems: "center", justifyContent: "center",
              }}>
                <UiText style={{ fontSize: 24, fontWeight: "900", color: "#fff" }}>{item.num}</UiText>
              </View>
              <UiText style={{ fontSize: 18, fontWeight: "700", color: C.black, flex: 1 }}>{item.label}</UiText>
            </View>
          ))}
        </View>

        {/* Statut */}
        {status !== "idle" && (
          <View style={{ backgroundColor: status === "done" ? "#2BAA6B" : C.blue, borderRadius: 20, padding: 20, alignItems: "center" }}>
            <UiText style={{ fontSize: 22, fontWeight: "900", color: "#fff" }}>
              {status === "calling" ? "📞 Appel en cours…" : "✅ Assistance contactée"}
            </UiText>
            <Pressable onPress={() => setStatus("idle")} style={{ marginTop: 12 }}>
              <UiText style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }}>Réinitialiser</UiText>
            </Pressable>
          </View>
        )}

      </View>
    </View>
  );
}