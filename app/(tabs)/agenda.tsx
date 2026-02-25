import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../src/ui/useTheme";
import { UiText } from "../../src/components/UiText";
import { useAgenda } from "../../src/hooks/useAgenda";
import type { AgendaItem } from "../../src/storage/agenda";
import { markTaken, snooze } from "../../src/storage/agenda";
import { ScreenHeader } from '@/src/components/ScreenHeader';

/* Helpers affichage */
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

/* Carte item */
function AgendaItemCard({
  item,
  onTaken,
  onSnooze15,
  onSnooze30,
}: {
  item: AgendaItem;
  onTaken?: () => void;
  onSnooze15?: () => void;
  onSnooze30?: () => void;
}) {
  const t = useTheme();
  const isTaken = !!item.takenAtISO;

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: t.colors.border,
        gap: 8,
        opacity: isTaken ? 0.6 : 1,
      }}
    >
      <UiText style={{ fontWeight: "900", fontSize: 18 }}>
        {formatTime(item.datetimeISO)} — {item.title}
      </UiText>

      {!!item.note && <UiText muted>{item.note}</UiText>}

      {!!item.snoozedUntilISO && !isTaken && (
        <UiText muted>
          Rappel à {formatTime(item.snoozedUntilISO)}
        </UiText>
      )}

      {/* Actions médicaments */}
      {item.type === "med" && !isTaken && (
        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {/* Pris = violet */}
          <Pressable
            onPress={onTaken}
            accessibilityRole="button"
            accessibilityLabel="Marquer comme pris"
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: t.colors.primary,
              backgroundColor: t.colors.primary,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <UiText style={{ fontWeight: "900", color: "#FFFFFF" }}>Pris</UiText>
          </Pressable>

          {/* +15 */}
          <Pressable
            onPress={onSnooze15}
            accessibilityRole="button"
            accessibilityLabel="Rappeler dans quinze minutes"
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: t.colors.border,
              backgroundColor: "transparent",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="time-outline" size={18} color={t.colors.text} />
            <UiText style={{ fontWeight: "900" }}>+15 min</UiText>
          </Pressable>

          {/* +30 */}
          <Pressable
            onPress={onSnooze30}
            accessibilityRole="button"
            accessibilityLabel="Rappeler dans trente minutes"
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: t.colors.border,
              backgroundColor: "transparent",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="time-outline" size={18} color={t.colors.text} />
            <UiText style={{ fontWeight: "900" }}>+30 min</UiText>
          </Pressable>
        </View>
      )}

      {/* Etat Pris = vert */}
      {item.type === "med" && isTaken && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="checkmark-circle" size={22} color={t.colors.success} />
          <UiText style={{ fontWeight: "900", color: t.colors.success }}>
            Pris
          </UiText>
        </View>
      )}
    </View>
  );
}

export default function AgendaScreen() {
  const t = useTheme();
  const { loading, today, tomorrow, upcoming, save } = useAgenda();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {/* Titre harmonisé) */}
      <ScreenHeader title="Agenda" subtitle="Aujourd'hui, demain et à venir" />

      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 16 }}>
        {loading ? (
          <UiText>Chargement…</UiText>
        ) : (
          <>
            {/* Aujourd’hui */}
            <View style={{ gap: 10 }}>
              <UiText style={{ fontWeight: "900" }}>Aujourd’hui</UiText>
              {today.length === 0 ? (
                <UiText muted>Rien de prévu aujourd’hui.</UiText>
              ) : (
                today.map((item) => (
                  <AgendaItemCard
                    key={item.id}
                    item={item}
                    onTaken={() => save(markTaken(item))}
                    onSnooze15={() => save(snooze(item, 15))}
                    onSnooze30={() => save(snooze(item, 30))}
                  />
                ))
              )}
            </View>

            {/* Demain */}
            <View style={{ gap: 10 }}>
              <UiText style={{ fontWeight: "900" }}>Demain</UiText>
              {tomorrow.length === 0 ? (
                <UiText muted>Rien de prévu demain.</UiText>
              ) : (
                tomorrow.map((item) => (
                  <AgendaItemCard key={item.id} item={item} />
                ))
              )}
            </View>

            {/* Prochain */}
            <View style={{ gap: 10 }}>
              <UiText style={{ fontWeight: "900" }}>Prochain</UiText>
              {upcoming.length === 0 ? (
                <UiText muted>Aucun évènement à venir.</UiText>
              ) : (
                upcoming.map((item) => (
                  <AgendaItemCard
                    key={item.id}
                    item={{
                      ...item,
                      title: `${formatDate(item.datetimeISO)} — ${item.title}`,
                    }}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
