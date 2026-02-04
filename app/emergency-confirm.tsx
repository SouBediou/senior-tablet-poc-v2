import { View, StyleSheet, Pressable, Vibration } from "react-native";
import { Screen } from "@/src/components/Screen";
import { UiText } from "@/src/components/UiText";
import { useTheme } from "@/src/ui/useTheme";
import { router } from "expo-router";


export default function EmergencyConfirmScreen() {
  const t = useTheme();

  const s = StyleSheet.create({
    wrap: { flex: 1, justifyContent: "center", gap: t.spacing.lg },
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.xl,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      ...t.shadow.card,
    },
    row: { flexDirection: "row", gap: t.spacing.md },
    btn: {
      flex: 1,
      borderRadius: t.radius.xl,
      paddingVertical: 18,
      alignItems: "center",
      borderWidth: 1,
    },
    cancel: { backgroundColor: t.colors.surface2, borderColor: t.colors.border },
    call: { backgroundColor: t.colors.danger, borderColor: "transparent" },
  });

  return (
    <Screen>
      <View style={s.wrap}>
        <UiText variant="h1" style={{ fontWeight: "900" }}>
          Confirmer l’appel
        </UiText>

        <View style={s.card}>
          <UiText variant="title" style={{ fontWeight: "900" }}>
            Voulez-vous appeler l’assistance ?
          </UiText>

          <View style={[s.row, { marginTop: t.spacing.lg }]}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                s.btn,
                s.cancel,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <UiText style={{ fontWeight: "900" }}>Annuler</UiText>
            </Pressable>

            <Pressable
              onPress={() => {
                Vibration.vibrate(60);
                router.replace("/(tabs)/emergency");
              }}
              style={({ pressed }) => [
                s.btn,
                s.call,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <UiText style={{ color: "#fff", fontWeight: "900" }}>
                Appeler
              </UiText>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}
