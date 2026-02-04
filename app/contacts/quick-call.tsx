import React, { useMemo } from "react";
import { View, Pressable, ScrollView, Linking, Alert } from "react-native";
import { router } from "expo-router";

import { UiText } from "@/src/components/UiText";
import { useContacts } from "@/src/hooks/useContacts";
import { useTheme } from "@/src/ui/useTheme";
import { useFocusEffect } from "@react-navigation/native";



export default function QuickCallScreen() {
  const t = useTheme();

  const { contacts, loading, refresh } = useContacts();
  const favorites = useMemo(() => contacts.filter((c) => c.favorite), [contacts]);
  const others = useMemo(() => contacts.filter((c) => !c.favorite), [contacts]);
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );
  

  function call(phone: string) {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then((ok) => {
      if (!ok) {
        Alert.alert("Appel impossible", "Cet appareil ne peut pas lancer d’appel.");
        return;
      }
      Linking.openURL(url);
    });
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ alignItems: "center", gap: t.spacing.sm }}>
  <View
    style={{
      marginTop: t.spacing.md,
      backgroundColor: "#f5ce5d",
      borderRadius: t.radius.lg,
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.lg,
      maxWidth: "92%",
    }}
  >
    <UiText style={{ fontWeight: "900", fontSize: 26, textAlign: "center" }}>
      Appel rapide
    </UiText>
  </View>

  <UiText muted style={{ textAlign: "center" }}>
    Toucher un nom pour appeler
  </UiText>
</View>


<View style={{ flexDirection: "row", gap: 10 }}>
  <Pressable
    onPress={() => router.push("/contacts")}
    accessibilityRole="button"
    accessibilityLabel="Gérer mes contacts"
    accessibilityHint="Voir, modifier ou supprimer des contacts"
    style={{
      flex: 1,
      padding: 14,
      borderRadius: 18,
      borderWidth: 2,
      alignItems: "center",
    }}
  >
    <UiText style={{ fontWeight: "900", fontSize: 18 }}>
      Gérer mes contacts
    </UiText>
  </Pressable>

  <Pressable
    onPress={() => router.push("/contacts/edit")}
    accessibilityRole="button"
    accessibilityLabel="Ajouter un contact"
    accessibilityHint="Créer un nouveau contact"
    style={{
      flex: 1,
      padding: 14,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: t.colors.primary,
      backgroundColor: t.colors.primary,
      alignItems: "center",
    }}
  >
    <UiText style={{ fontWeight: "900", fontSize: 18, color: "#FFFFFF" }}>
      + Ajouter
    </UiText>
  </Pressable>
</View>


      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 10 }}>
        {loading ? (
          <UiText>Chargement…</UiText>
        ) : contacts.length === 0 ? (
          <View style={{ gap: 10 }}>
            <UiText muted>Aucun contact enregistré.</UiText>

            <Pressable
              onPress={() => router.push("/contacts/edit")}
              accessibilityRole="button"
              accessibilityHint="Créer un contact famille ou soignant"
              style={{
                padding: 16,
                borderRadius: 18,
                borderWidth: 2,
                alignItems: "center",
              }}
            >
              <UiText style={{ fontWeight: "900", fontSize: 18 }}>
                + Ajouter un contact
              </UiText>
            </Pressable>
          </View>
        ) : (
          <>
            {favorites.length > 0 && (
              <>
                <UiText style={{ fontWeight: "900" }}>Favoris</UiText>

                {favorites.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => call(c.phone)}
                    accessibilityRole="button"
                    accessibilityLabel={`Appeler ${c.name}`}
                    accessibilityHint="Lance un appel téléphonique"
                    style={{
                      padding: 18,
                      borderRadius: 20,
                      borderWidth: 2,
                      gap: 6,
                    }}
                  >
                    <UiText style={{ fontWeight: "900", fontSize: 22 }}>
                      ⭐ {c.name}
                    </UiText>
                    <UiText muted style={{ fontSize: 18 }}>
                      {c.phone}
                    </UiText>
                  </Pressable>
                ))}
              </>
            )}

            <UiText style={{ fontWeight: "900", marginTop: favorites.length ? 8 : 0 }}>
              Autres
            </UiText>

            {others.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => call(c.phone)}
                accessibilityRole="button"
                accessibilityLabel={`Appeler ${c.name}`}
                accessibilityHint="Lance un appel téléphonique"
                style={{
                  padding: 18,
                  borderRadius: 20,
                  borderWidth: 2,
                  gap: 6,
                }}
              >
                <UiText style={{ fontWeight: "900", fontSize: 22 }}>{c.name}</UiText>
                <UiText muted style={{ fontSize: 18 }}>
                  {c.phone}
                </UiText>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
