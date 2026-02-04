import React, { useMemo, useState } from "react";
import { View, Pressable, TextInput, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useContacts } from "../../src/hooks/useContacts";
import type { Contact, ContactRole } from "../../src/storage/contacts";
import { normalizePhone } from "../../src/storage/contacts";
import { UiText } from "../../src/components/UiText";
import { useTheme } from "@/src/ui/useTheme";


const ROLE_OPTIONS: { key: ContactRole; label: string }[] = [
  { key: "family", label: "Famille / proche" },
  { key: "care", label: "Soignant" },
  { key: "other", label: "Autre" },
];

function makeId() {
  return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ContactEditScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { contacts, save, remove } = useContacts();

  const existing = useMemo(() => contacts.find((c) => c.id === id), [contacts, id]);

  const [name, setName] = useState(existing?.name ?? "");
  const [role, setRole] = useState<ContactRole>(existing?.role ?? "family");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [favorite, setFavorite] = useState(!!existing?.favorite);

  const isEditing = !!existing;

  async function onSave() {
    const cleanName = name.trim();
    const cleanPhone = normalizePhone(phone.trim());

    if (!cleanName) return Alert.alert("Nom manquant", "Veuillez entrer un nom.");
    if (!cleanPhone) return Alert.alert("Téléphone manquant", "Veuillez entrer un numéro.");

    const payload: Contact = {
      id: existing?.id ?? makeId(),
      name: cleanName,
      role,
      phone: cleanPhone,
      notes: notes.trim() || undefined,
      favorite,
    };

    await save(payload);
    router.back();
  }

  async function onDelete() {
    if (!existing) return;
    Alert.alert("Supprimer ?", `Supprimer ${existing.name} ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await remove(existing.id);
          router.replace("/contacts");
        },
      },
    ]);
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
      {isEditing ? "Modifier le contact" : "Ajouter un contact"}
    </UiText>
  </View>

  <UiText muted style={{ textAlign: "center" }}>
    {isEditing ? "Mettre à jour les informations" : "Remplir les champs"}
  </UiText>
</View>


      <View style={{ gap: 8 }}>
        <UiText style={{ fontWeight: "800" }}>Nom</UiText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex : Marie"
          style={{ borderWidth: 2, borderRadius: 14, padding: 14, fontSize: 18 }}
        />
      </View>

      <View style={{ gap: 8 }}>
        <UiText style={{ fontWeight: "800" }}>Type</UiText>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {ROLE_OPTIONS.map((opt) => (
            <Pressable
            key={opt.key}
            onPress={() => setRole(opt.key)}
            accessibilityRole="button"
            accessibilityLabel={`Type ${opt.label}`}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: role === opt.key ? t.colors.primary : t.colors.border,
              backgroundColor: role === opt.key ? t.colors.primary : "transparent",
            }}
          >
            <UiText
              style={{
                fontWeight: "800",
                color: role === opt.key ? "#FFFFFF" : t.colors.text,
              }}
            >
              {opt.label}
            </UiText>
          </Pressable>
          
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <UiText style={{ fontWeight: "800" }}>Téléphone</UiText>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="Ex : +33612345678"
          style={{ borderWidth: 2, borderRadius: 14, padding: 14, fontSize: 18 }}
        />
        <UiText muted>Astuce : espaces et tirets sont acceptés.</UiText>
      </View>

      <View style={{ gap: 8 }}>
        <UiText style={{ fontWeight: "800" }}>Note (optionnel)</UiText>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Ex : infirmière le matin"
          style={{ borderWidth: 2, borderRadius: 14, padding: 14, fontSize: 18 }}
        />
      </View>

      <Pressable
  onPress={() => setFavorite((v) => !v)}
  accessibilityRole="button"
  accessibilityLabel={favorite ? "Retirer des favoris" : "Mettre en favori"}
  accessibilityHint="Ajoute ce contact dans l’appel rapide"
  style={{
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: favorite ? "#f5ce5d" : t.colors.border,
    backgroundColor: favorite ? "#f5ce5d" : "transparent",
  }}
>
  <UiText
    style={{
      fontWeight: "900",
      fontSize: 18,
      textAlign: "center",
      color: favorite ? "#111" : t.colors.text,
    }}
  >
    {favorite ? "⭐ Favori (appel rapide)" : "☆ Mettre en favori"}
  </UiText>

  <UiText muted style={{ textAlign: "center", marginTop: 6 }}>
    {favorite
      ? "Ce contact apparaîtra en haut de l’appel rapide"
      : "Utile pour appeler en 1 toucher"}
  </UiText>
</Pressable>


      <View style={{ flexDirection: "row", gap: 10 }}>
      <Pressable
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel="Enregistrer le contact"
          accessibilityHint="Sauvegarde les informations"
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
            Enregistrer
          </UiText>
        </Pressable>


        {isEditing ? (
  <Pressable
    onPress={onDelete}
    accessibilityRole="button"
    accessibilityLabel="Supprimer le contact"
    accessibilityHint="Supprime définitivement ce contact"
    style={{
      padding: 16,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: t.colors.danger,
      backgroundColor: "transparent",
      alignItems: "center",
    }}
  >
    <UiText style={{ fontWeight: "900", fontSize: 18, color: t.colors.danger }}>
      Supprimer
    </UiText>
  </Pressable>
) : null}

      </View>

      <Pressable onPress={() => router.back()} style={{ padding: 12, alignItems: "center" }}>
        <UiText muted>Retour</UiText>
      </Pressable>
    </View>
  );
}
