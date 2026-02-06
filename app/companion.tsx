import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Animated, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Screen } from "@/src/components/Screen";
import { UiText } from "@/src/components/UiText";
import { CompanionHeader } from "@/src/components/CompanionHeader";
import { useTheme } from "@/src/ui/useTheme";
import { useVoiceAgent } from "@/src/hooks/useVoiceAgent";

export default function CompanionScreen() {
  const t = useTheme();

  const [avatarId, setAvatarId] = useState<string>("femme");
  const pulse = useRef(new Animated.Value(0)).current;

  // Hook vocal custom
  const {
    phase,
    transcript,
    response,
    errorMsg,
    isListening,
    startListening,
    stopListening,
    cancel,
  } = useVoiceAgent({
    avatarId,
    onTranscript: (text) => console.log("📝 User:", text),
    onResponse: (text) => console.log("🤖 Assistant:", text),
    onError: (err) => console.error("❌ Error:", err),
  });

  // Charger avatar
  useEffect(() => {
    AsyncStorage.getItem("companion.avatarId").then((v) => {
      if (v) {
        console.log("👤 Avatar:", v);
        setAvatarId(v.toLowerCase());
      }
    });
  }, []);

  // Animation pulse
  useEffect(() => {
    if (isListening) {
      startPulse();
    } else {
      stopPulse();
    }
  }, [isListening]);

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
    Vibration.vibrate(20);

    if (isListening) {
      // Stop recording and process
      await stopListening();
    } else if (phase === "idle") {
      // Start recording
      await startListening();
    } else {
      // Cancel current operation
      await cancel();
    }
  };

  const getLabel = (): string => {
    switch (phase) {
      case "listening":
        return "Je vous écoute… (touchez pour envoyer)";
      case "processing":
        return "Je réfléchis…";
      case "speaking":
        return "Je vous réponds…";
      case "error":
        return `Erreur: ${errorMsg}`;
      default:
        return "Touchez pour parler";
    }
  };

  const getMicColor = (): string => {
    switch (phase) {
      case "listening":
        return t.colors.danger;
      case "processing":
        return "#f59e0b";
      case "speaking":
        return t.colors.success;
      default:
        return t.colors.primary;
    }
  };

  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const s = StyleSheet.create({
    header: { gap: 8, marginBottom: t.spacing.lg },
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 999,
      backgroundColor: getMicColor(),
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
      backgroundColor: getMicColor(),
      alignItems: "center",
      justifyContent: "center",
    },
    transcript: {
      marginTop: t.spacing.lg,
      padding: t.spacing.md,
      backgroundColor: t.colors.surface,
      borderRadius: 12,
    },
    responseBox: {
      marginTop: t.spacing.md,
      padding: t.spacing.md,
      backgroundColor: t.colors.primary + "15",
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: t.colors.primary,
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
              isListening
                ? { transform: [{ scale: dotScale }], opacity: dotOpacity }
                : { opacity: 0.6 },
            ]}
          />
          <UiText muted>{getLabel()}</UiText>
        </View>
      </View>

      <Pressable onPress={onPress} style={s.micWrap}>
        <View style={s.micInner}>
          <Ionicons
            name={isListening ? "stop" : phase === "processing" ? "hourglass" : "mic"}
            size={46}
            color="#fff"
          />
        </View>
      </Pressable>

      {transcript ? (
        <View style={s.transcript}>
          <UiText muted variant="small">Vous avez dit :</UiText>
          <UiText>{transcript}</UiText>
        </View>
      ) : null}

      {response ? (
        <View style={s.responseBox}>
          <UiText>{response}</UiText>
        </View>
      ) : null}
    </Screen>
  );
}
