import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { CompanionId, DEFAULT_COMPANION } from "./companionConfig";

const STORAGE_KEY = "companion.avatarId";

export function useCompanion() {
  const [avatarId, setAvatarId] = useState<CompanionId>(DEFAULT_COMPANION);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      if (value === "femme" || value === "homme" || value === "dynamique") {
        setAvatarId(value);
      } else {
        setAvatarId(DEFAULT_COMPANION);
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  // Recharge à chaque focus (retour sur l’écran)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { avatarId, loaded };
}
