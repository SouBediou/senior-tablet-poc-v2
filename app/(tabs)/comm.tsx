import { useFocusEffect } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";

import { useTheme } from "@/src/ui/useTheme";
import { useContacts } from "@/src/hooks/useContacts";
import type { ContactRole } from "@/src/storage/contacts";
import { UiText } from "@/src/components/UiText";


const ROLE_LABEL: Record<ContactRole, string> = {
  family: "Famille / proche",
  care: "Soignant",
  other: "Autre",
};

export default function CommScreen() {
  const t = useTheme();
  const { contacts, loading, refresh } = useContacts();
  const [roleFilter, setRoleFilter] = useState<ContactRole | "all">("all");

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filtered = useMemo(() => {
    if (roleFilter === "all") return contacts;
    return contacts.filter((c) => c.role === roleFilter);
  }, [contacts, roleFilter]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ alignItems: "center", gap: t.spacing.sm }}>
        <View style={{
          marginTop: t.spacing.md,
          backgroundColor: "#f5ce5d",
          borderRadius: t.radius.lg,
          paddingVertical: t.spacing.md,
          paddingHorizontal: t.spacing.lg,
          maxWidth: "92%",
        }}>
          <UiText style={{ fontWeight: "900", fontSize: 26, textAlign: "center" }}>
            Contacts
          </UiText>
        </View>
        <UiText muted style={{ textAlign: "center" }}>
          Ajouter un proche ou un soignant
        </UiText>
      </View>

      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {(["all", "family", "care", "other"] as const).map((k) => {
          const isActive = roleFilter === k;
          return (
            <Pressable
              key={k}
              onPress={() => setRoleFilter(k)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: isActive ? t.colors.primary : t.colors.border,
                backgroundColor: isActive ? t.colors.primary : "transparent",
              }}
            >
              <UiText style={{ fontWeight: "800", color: isActive ? "#FFFFFF" : t.colors.text }}>
                {k === "all" ? "Tous" : ROLE_LABEL[k]}
              </UiText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push("/contacts/edit")}
        style={{
          padding: 16,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: t.colors.primary,
          backgroundColor: t.colors.primary,
          alignItems: "center",
        }}
      >
        <UiText style={{ fontWeight: "900", fontSize: 18, color: "#FFFFFF" }}>
          + Ajouter un contact
        </UiText>
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 10 }}>
        {loading ? (
          <UiText>Chargement…</UiText>
        ) : filtered.length === 0 ? (
          <UiText muted>Aucun contact pour le moment.</UiText>
        ) : (
          filtered.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => router.push({ pathname: "/contacts/edit", params: { id: c.id } })}
              style={{
                padding: 16,
                borderRadius: 18,
                borderWidth: 2,
                borderColor: t.colors.border,
                gap: 6,
              }}
            >
              <UiText style={{ fontWeight: "900", fontSize: 18 }}>{c.name}</UiText>
              <UiText muted>{ROLE_LABEL[c.role]} • {c.phone}</UiText>
              {c.favorite ? <UiText>⭐ Favori</UiText> : null}
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}