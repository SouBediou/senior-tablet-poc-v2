import { useFocusEffect } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useContacts } from "@/src/hooks/useContacts";
import type { ContactRole } from "@/src/storage/contacts";
import { UiText } from "@/src/components/UiText";

const C = { blue: "#3481f8", yellow: "#ffce36", black: "#111111", white: "#ffffff" };

const ROLE_LABEL: Record<ContactRole, string> = {
  family: "Famille",
  care: "Soignant",
  other: "Autre",
};

const ROLE_EMOJI: Record<ContactRole, string> = {
  family: "👨‍👩‍👧",
  care: "🏥",
  other: "👤",
};

export default function CommScreen() {
  const { contacts, loading, refresh } = useContacts();
  const [roleFilter, setRoleFilter] = useState<ContactRole | "all">("all");

  useFocusEffect(React.useCallback(() => { refresh(); }, [refresh]));

  const filtered = useMemo(() => {
    if (roleFilter === "all") return contacts;
    return contacts.filter((c) => c.role === roleFilter);
  }, [contacts, roleFilter]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header jaune */}
      <View style={{ backgroundColor: C.yellow, paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 }}>
        <UiText style={{ fontSize: 32, fontWeight: "900", color: C.black }}>Contacts</UiText>
        <UiText style={{ fontSize: 17, color: "rgba(0,0,0,0.55)", marginTop: 4 }}>Famille & soignants</UiText>
      </View>

      <View style={{ padding: 16, gap: 14 }}>
        {/* Filtres */}
        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {(["all", "family", "care", "other"] as const).map((k) => {
            const isActive = roleFilter === k;
            return (
              <Pressable key={k} onPress={() => setRoleFilter(k)} style={{
                paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16,
                backgroundColor: isActive ? C.blue : "#fff",
                borderWidth: 2,
                borderColor: isActive ? C.blue : "#e0e0e0",
              }}>
                <UiText style={{ fontWeight: "800", fontSize: 17, color: isActive ? "#fff" : C.black }}>
                  {k === "all" ? "Tous" : ROLE_LABEL[k]}
                </UiText>
              </Pressable>
            );
          })}
        </View>

        {/* Bouton ajouter */}
        <Pressable onPress={() => router.push("/contacts/edit")} style={{
          padding: 20, borderRadius: 20, backgroundColor: C.blue, alignItems: "center",
          flexDirection: "row", justifyContent: "center", gap: 10,
        }}>
          <UiText style={{ fontWeight: "900", fontSize: 22, color: "#fff" }}>+ Ajouter un contact</UiText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}>
        {loading ? (
          <UiText style={{ fontSize: 18, textAlign: "center", marginTop: 40 }}>Chargement…</UiText>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 40, gap: 12 }}>
            <UiText style={{ fontSize: 48 }}>👥</UiText>
            <UiText style={{ fontSize: 18, color: "#888", textAlign: "center" }}>
              Aucun contact pour le moment.{"\n"}Appuyez sur + pour en ajouter un.
            </UiText>
          </View>
        ) : (
          filtered.map((c) => (
            <Pressable key={c.id} onPress={() => router.push({ pathname: "/contacts/edit", params: { id: c.id } })}
              style={{
                padding: 20, borderRadius: 20, backgroundColor: "#fff", gap: 6,
                shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                flexDirection: "row", alignItems: "center",
              }}
            >
              <UiText style={{ fontSize: 40, marginRight: 8 }}>{ROLE_EMOJI[c.role] || "👤"}</UiText>
              <View style={{ flex: 1 }}>
                <UiText style={{ fontWeight: "900", fontSize: 22, color: C.black }}>{c.name}</UiText>
                <UiText style={{ fontSize: 16, color: "#888", marginTop: 2 }}>
                  {ROLE_LABEL[c.role]} · {c.phone}
                </UiText>
                {c.favorite && <UiText style={{ fontSize: 14, marginTop: 4 }}>⭐ Favori</UiText>}
              </View>
              <UiText style={{ fontSize: 28, color: C.blue, fontWeight: "900" }}>→</UiText>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}