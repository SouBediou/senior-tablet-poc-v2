import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { UiText } from '@/src/components/UiText';
import { useTheme } from '@/src/ui/useTheme';
import { useProfile, SeniorProfile } from '@/src/hooks/useProfile';
import { ScreenHeader } from '@/src/components/ScreenHeader';

export default function ProfileScreen() {
  const t = useTheme();
  const { profile, saveProfile, loaded } = useProfile();
  const [form, setForm] = useState<SeniorProfile>(profile);

  useEffect(() => {
    if (loaded) setForm(profile);
  }, [loaded]);

  const s = StyleSheet.create({
    title: {
      marginBottom: t.spacing.lg,
    },
    field: {
      marginBottom: t.spacing.md,
    },
    label: {
      fontWeight: '700',
      marginBottom: 6,
      color: t.colors.muted,
    },
    input: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: t.spacing.md,
      fontSize: 18,
      color: t.colors.text,
    },
    btn: {
      backgroundColor: t.colors.primary,
      borderRadius: t.radius.xl,
      padding: t.spacing.lg,
      alignItems: 'center',
      marginTop: t.spacing.lg,
    },
    btnText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '900',
    },
  });

  const handleSave = async () => {
    await saveProfile(form);
    Alert.alert('✅ Profil sauvegardé', 'Les informations ont été enregistrées.');
  };

  const fields: { key: keyof SeniorProfile; label: string; placeholder: string }[] = [
    { key: 'prenom', label: 'Prénom', placeholder: 'Ex : Marie' },
    { key: 'age', label: 'Âge', placeholder: 'Ex : 78' },
    { key: 'enfants', label: 'Enfants', placeholder: 'Ex : Sophie, Pierre' },
    { key: 'interets', label: 'Centres d\'intérêt', placeholder: 'Ex : jardinage, cuisine, musique' },
    { key: 'profession', label: 'Ancienne profession', placeholder: 'Ex : institutrice' },
    { key: 'ville', label: 'Ville', placeholder: 'Ex : Lyon' },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Profil" subtitle="Informations renseignées par l'aidant" />

        {fields.map(({ key, label, placeholder }) => (
          <View key={key} style={s.field}>
            <UiText style={s.label}>{label}</UiText>
            <TextInput
              style={s.input}
              value={form[key]}
              onChangeText={(val) => setForm({ ...form, [key]: val })}
              placeholder={placeholder}
              placeholderTextColor={t.colors.muted}
            />
          </View>
        ))}

        <Pressable style={s.btn} onPress={handleSave}>
          <UiText style={s.btnText}>Sauvegarder</UiText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}