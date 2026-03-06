import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/ui/useTheme";
import { UiText } from "../../src/components/UiText";
import { useAgenda } from "../../src/hooks/useAgenda";
import type { AgendaItem } from "../../src/storage/agenda";
import { markTaken, snooze } from "../../src/storage/agenda";

const C = { blue: "#3481f8", yellow: "#ffce36", black: "#111111", white: "#ffffff" };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function AgendaItemCard({ item, onTaken, onSnooze15, onSnooze30 }: {
  item: AgendaItem;
  onTaken?: () => void;
  onSnooze15?: () => void;
  onSnooze30?: () => void;
}) {
  const isTaken = !!item.takenAtISO;
  return (
    <View style={{
      padding: 20,
      borderRadius: 20,
      backgroundColor: "#fff",
      gap: 10,
      opacity: isTaken ? 0.6 : 1,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    }}>
      <UiText style={{ fontWeight: "900", fontSize: 22, color: C.black }}>
        {formatTime(item.datetimeISO)} — {item.title}
      </UiText>
      {!!item.note && <UiText style={{ fontSize: 17, color: "#555" }}>{item.note}</UiText>}
      {!!item.snoozedUntilISO && !isTaken && (
        <UiText style={{ fontSize: 16, color: "#888" }}>Rappel à {formatTime(item.snoozedUntilISO)}</UiText>
      )}
      {item.type === "med" && !isTaken && (
        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <Pressable onPress={onTaken} style={{
            paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16,
            backgroundColor: C.blue, flexDirection: "row", alignItems: "center", gap: 8,
          }}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <UiText style={{ fontWeight: "900", fontSize: 18, color: "#fff" }}>Pris</UiText>
          </Pressable>
          <Pressable onPress={onSnooze15} style={{
            paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16,
            borderWidth: 2, borderColor: "#ddd", flexDirection: "row", alignItems: "center", gap: 8,
          }}>
            <Ionicons name="time-outline" size={22} color={C.black} />
            <UiText style={{ fontWeight: "900", fontSize: 18 }}>+15 min</UiText>
          </Pressable>
          <Pressable onPress={onSnooze30} style={{
            paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16,
            borderWidth: 2, borderColor: "#ddd", flexDirection: "row", alignItems: "center", gap: 8,
          }}>
            <Ionicons name="time-outline" size={22} color={C.black} />
            <UiText style={{ fontWeight: "900", fontSize: 18 }}>+30 min</UiText>
          </Pressable>
        </View>
      )}
      {item.type === "med" && isTaken && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="checkmark-circle" size={26} color="#2BAA6B" />
          <UiText style={{ fontWeight: "900", fontSize: 18, color: "#2BAA6B" }}>Pris ✓</UiText>
        </View>
      )}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <View style={{ flex: 1, height: 2, backgroundColor: C.blue, opacity: 0.15, borderRadius: 2 }} />
      <UiText style={{ fontWeight: "900", fontSize: 20, color: C.black }}>{title}</UiText>
      <View style={{ flex: 1, height: 2, backgroundColor: C.blue, opacity: 0.15, borderRadius: 2 }} />
    </View>
  );
}

export default function AgendaScreen() {
  const { loading, today, tomorrow, upcoming, save } = useAgenda();

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View style={{ backgroundColor: C.blue, paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 }}>
        <UiText style={{ fontSize: 32, fontWeight: "900", color: "#fff" }}>Agenda</UiText>
        <UiText style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
          Aujourd'hui, demain et à venir
        </UiText>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
        {loading ? (
          <UiText style={{ fontSize: 18, textAlign: "center", marginTop: 40 }}>Chargement…</UiText>
        ) : (
          <>
            <View style={{ gap: 10 }}>
              <SectionTitle title="Aujourd'hui" />
              {today.length === 0
                ? <UiText style={{ fontSize: 17, color: "#888", textAlign: "center", paddingVertical: 20 }}>Rien de prévu aujourd'hui 🌟</UiText>
                : today.map(item => (
                  <AgendaItemCard key={item.id} item={item}
                    onTaken={() => save(markTaken(item))}
                    onSnooze15={() => save(snooze(item, 15))}
                    onSnooze30={() => save(snooze(item, 30))}
                  />
                ))
              }
            </View>
            <View style={{ gap: 10 }}>
              <SectionTitle title="Demain" />
              {tomorrow.length === 0
                ? <UiText style={{ fontSize: 17, color: "#888", textAlign: "center", paddingVertical: 20 }}>Rien de prévu demain</UiText>
                : tomorrow.map(item => <AgendaItemCard key={item.id} item={item} />)
              }
            </View>
            <View style={{ gap: 10 }}>
              <SectionTitle title="À venir" />
              {upcoming.length === 0
                ? <UiText style={{ fontSize: 17, color: "#888", textAlign: "center", paddingVertical: 20 }}>Aucun évènement à venir</UiText>
                : upcoming.map(item => (
                  <AgendaItemCard key={item.id} item={{ ...item, title: `${formatDate(item.datetimeISO)} — ${item.title}` }} />
                ))
              }
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}