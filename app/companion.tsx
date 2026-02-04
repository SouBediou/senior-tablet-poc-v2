import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Animated, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Screen } from "@/src/components/Screen";
import { UiText } from "@/src/components/UiText";
import { CompanionHeader } from "@/src/components/CompanionHeader";
import { useTheme } from "@/src/ui/useTheme";
import Vapi from "@vapi-ai/react-native";

const ASSISTANT_ID_BY_AVATAR: Record<string, string> = {
  femme: "108558c3-b81a-4a38-98dc-5d6b216a2c5a",
  homme: "f822112d-ed69-4d7d-899b-003ac03c11eb",
  dynamique: "f02351da-71f7-4dbf-bab5-fe5a6af67e6b",
};

type Phase = "idle" | "listening" | "speaking" | "error";

export default function CompanionScreen() {
  const t = useTheme();

  const [phase, setPhase] = useState<Phase>("idle");
  const [active, setActive] = useState(false);
  const [avatarId, setAvatarId] = useState<string>("femme");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const pulse = useRef(new Animated.Value(0)).current;
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const key = (process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY || "").trim();
    console.log("🔑 VAPI KEY:", key.slice(0, 10) + "...", "length:", key.length);

    if (!key) {
      console.error("❌ Missing EXPO_PUBLIC_VAPI_PUBLIC_KEY");
      setPhase("error");
      setErrorMsg("Clé API manquante");
      return;
    }

    const vapi = new Vapi(key);
    vapiRef.current = vapi;

    // 📞 CALL START
    vapi.on("call-start", () => {
      console.log("✅ Call started");
      setPhase("listening");
      setActive(true);
    });

    // 🎤 SPEECH START
    vapi.on("speech-start", () => {
      console.log("🎤 Speech started");
      setPhase("listening");
    });

    // 🛑 SPEECH END
    vapi.on("speech-end", () => {
      console.log("🛑 Speech ended");
    });

    // 💬 MESSAGES (remplace transcript)
    vapi.on("message", (msg: any) => {
      console.log("💬 Message reçu:", msg);
      
      // Logs détaillés pour debug
      if (msg.type === "transcript") {
        console.log("📝 Transcript:", {
          role: msg.role,
          type: msg.transcriptType,
          text: msg.transcript
        });
      }
      
      // Détecter assistant qui parle
      if (msg.type === "transcript" && msg.role === "assistant") {
        console.log("🗣️ Assistant is speaking");
        setPhase("speaking");
      }
      
      // Détecter user qui parle
      if (msg.type === "transcript" && msg.role === "user") {
        console.log("👤 User is speaking");
        setPhase("listening");
      }
    });

    // 🔚 CALL END
    vapi.on("call-end", () => {
      console.log("🔚 Call ended");
      setPhase("idle");
      setActive(false);
      stopPulse();
    });

    // ❌ ERROR
    vapi.on("error", (e: any) => {
      console.log("⚠️ Vapi error event:", JSON.stringify(e, null, 2));
      
      // Fin normale de session
      if (e?.error?.msg === "Meeting has ended" || e?.error?.type === "ejected") {
        console.log("ℹ️ Session ended normally");
        setPhase("idle");
        setActive(false);
        stopPulse();
        return;
      }

      // Vraie erreur
      console.error("❌ Vapi error:", e);
      setPhase("error");
      setErrorMsg(e?.error?.msg || e?.message || "Erreur inconnue");
      setActive(false);
      stopPulse();
    });

    // Charger avatar
    AsyncStorage.getItem("companion.avatarId").then((v) => {
      if (v) {
        console.log("👤 Avatar:", v);
        setAvatarId(v.toLowerCase());
      }
    });

    return () => {
      console.log("🧹 Cleanup");
      try {
        vapi.stop();
      } catch {}
    };
  }, []);

  const startPulse = () => {
    pulse.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulse.stopAnimation();
    pulse.setValue(0);
  };

  const onPress = async () => {
    const vapi = vapiRef.current;
    if (!vapi) {
      console.error("❌ Vapi not initialized");
      return;
    }

    // Stop si déjà actif
    if (active) {
      console.log("🛑 Stopping...");
      try {
        vapi.stop();
      } catch (e) {
        console.log("Stop error (ignoré):", e);
      }
      setActive(false);
      setPhase("idle");
      stopPulse();
      return;
    }

    const assistantId = ASSISTANT_ID_BY_AVATAR[avatarId] || ASSISTANT_ID_BY_AVATAR.femme;
    console.log("🚀 Starting with assistantId:", assistantId);

    try {
      // Reset
      try {
        vapi.stop();
      } catch {}

      // UI
      setActive(true);
      setPhase("listening");
      setErrorMsg("");
      Vibration.vibrate(20);
      startPulse();

      // ✅ Start avec STRING directement
      await vapi.start(assistantId);
      
      console.log("✅ vapi.start() called successfully");

    } catch (e: any) {
      console.error("❌ Start failed:", e);
      setActive(false);
      setPhase("error");
      setErrorMsg(e?.message || "Erreur démarrage");
      stopPulse();
    }
  };

  const label =
    phase === "listening"
      ? "Je vous écoute…"
      : phase === "speaking"
      ? "Je vous réponds…"
      : phase === "error"
      ? `Erreur: ${errorMsg}`
      : "Touchez pour parler";

  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const s = StyleSheet.create({
    header: { gap: 8, marginBottom: t.spacing.lg },
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 999,
      backgroundColor: t.colors.primary,
    },
    micWrap: {
      alignSelf: "center",
      marginTop: t.spacing.xl,
      width: 140,
      height: 140,
      borderRadius: 999,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    micInner: {
      width: 110,
      height: 110,
      borderRadius: 999,
      backgroundColor: phase === "listening" ? t.colors.danger : t.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <Screen>
      <View style={s.header}>
        <CompanionHeader title="Bonjour" subtitle="Touchez pour parler" />
        <View style={s.row}>
          <Animated.View
            style={[
              s.dot,
              phase === "listening"
                ? { transform: [{ scale: dotScale }], opacity: dotOpacity }
                : { opacity: 0.6 },
            ]}
          />
          <UiText muted>{label}</UiText>
        </View>
      </View>

      <Pressable onPress={onPress} style={s.micWrap}>
        <View style={s.micInner}>
          <Ionicons name={active ? "mic" : "mic-outline"} size={46} color="#fff" />
        </View>
      </Pressable>
    </Screen>
  );
}