import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/ui/useTheme";

export default function TabsLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  // ✅ On remonte la barre au-dessus des boutons système Android
  // - insets.bottom gère automatiquement les barres système (Android/iOS)
  // - on ajoute une marge “confort senior”
  const bottomPad = Math.max(insets.bottom, 10) + 12;

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,

        // ✅ Barre violette, sans icônes, texte blanc
        tabBarStyle: {
          backgroundColor: t.colors.ink, // violet #411C68
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: bottomPad, // ✅ la clé : remonte la barre
          height: 62 + bottomPad,    // ✅ hauteur totale cohérente
        },

        tabBarLabelStyle: {
          fontSize: 18,
          fontWeight: "900",
        },
        tabBarActiveTintColor: "#411C68",
        tabBarInactiveTintColor: "rgba(65,28,104,0.6)",

        // ✅ pas d’icônes
        tabBarIconStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Accueil" }} />
      <Tabs.Screen name="comm" options={{ title: "Contacts" }} />
      <Tabs.Screen name="games" options={{ title: "Jeux" }} />
      <Tabs.Screen name="agenda" options={{ title: "Agenda" }} />
      <Tabs.Screen name="emergency" options={{ title: "Urgence" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
    
  );
}
