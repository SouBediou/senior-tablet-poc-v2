import React, { useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Vibration, Platform } from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { Screen } from "@/src/components/Screen";
import { UiText } from "@/src/components/UiText";
import { useTheme } from "@/src/ui/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Phase = "idle" | "recording" | "transcribing" | "speaking";

const URGENCE_KEYWORDS = [
  "urgence",
  "au secours",
  "aide",
  "help",
  "j'ai mal",
  "je suis tomb",
  "chute",
  "malaise",
  "je saigne",
  "ambulance",
];

const WHISPER_API_BASE = "https://whisper-api-xfhp.onrender.com"; // <- ton URL Render
const WHISPER_TRANSCRIBE_URL = `${WHISPER_API_BASE}/transcribe`;

export default function CompanionScreen() {
  const t = useTheme();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastText, setLastText] = useState<string>("");
  const recordingRef = useRef<Audio.Recording | null>(null);

  const s = useMemo(
    () =>
      StyleSheet.create({
        header: { gap: 8, marginBottom: t.spacing.lg },
        card: {
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.xl,
          padding: t.spacing.lg,
          borderWidth: 1,
          borderColor: t.colors.border,
          ...t.shadow.card,
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
          ...t.shadow.card,
        },
        micInner: {
          width: 110,
          height: 110,
          borderRadius: 999,
          backgroundColor: phase === "recording" ? t.colors.danger : t.colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        hint: { textAlign: "center", marginTop: t.spacing.lg },
      }),
    [t, phase]
  );

  async function startRecording() {
    try {
      setLastText("");
      Vibration.vibrate(30);

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setLastText("Micro non autorisé. Activez-le dans les paramètres.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      recordingRef.current = rec;

      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setPhase("recording");
    } catch (e: any) {
      setPhase("idle");
      setLastText("Erreur micro: " + (e?.message ?? String(e)));
    }
  }

  async function stopRecordingAndProcess() {
    const rec = recordingRef.current;
    if (!rec) return;

    try {
      setPhase("transcribing");
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;

      if (!uri) {
        setPhase("idle");
        setLastText("Enregistrement introuvable.");
        return;
      }

      const text = await transcribeWithServer(uri);
      setLastText(text || "(Je n’ai pas compris.)");

      if (isUrgence(text)) {
        Speech.stop();
        setPhase("idle");
        router.push("/emergency-confirm");
        return;
      }

      const reply = generateReply(text);
      setPhase("speaking");
      Speech.speak(reply, {
        language: "fr-FR",
        rate: Platform.OS === "android" ? 0.95 : 1.0,
      });

      setTimeout(() => setPhase("idle"), 800);
    } catch (e: any) {
      setPhase("idle");
      setLastText("Erreur transcription: " + (e?.message ?? String(e)));
    }
  }

  function isUrgence(text: string) {
    const low = (text || "").toLowerCase();
    return URGENCE_KEYWORDS.some((k) => low.includes(k));
  }

  function generateReply(text: string) {
    const low = (text || "").toLowerCase();
    if (!text) return "Je n’ai pas bien entendu. Pouvez-vous répéter ?";
    if (low.includes("bonjour")) return "Bonjour ! Je suis là avec vous. Que souhaitez-vous faire ?";
    if (low.includes("agenda") || low.includes("rappel")) return "D’accord. Allons voir votre agenda.";
    if (low.includes("jeu") || low.includes("memory") || low.includes("puzzle"))
      return "Très bien, allons dans les jeux.";
    return "D’accord. Je vous écoute. Dites-moi ce dont vous avez besoin.";
  }

  async function transcribeWithServer(audioUri: string): Promise<string> {
    const form = new FormData();

    // IMPORTANT: plus compatible que audio/m4a selon devices/serveurs
    form.append("audio", {
      uri: audioUri,
      name: "audio.mp4",
      type: "audio/mp4",
    } as any);

    const res = await fetch(WHISPER_TRANSCRIBE_URL, {
      method: "POST",
      body: form,
    });

    const raw = await res.text(); // utile pour debug (même si JSON)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${raw}`);
    }

    const data = JSON.parse(raw);
    return data.text ?? "";
  }

  const hint =
    phase === "recording"
      ? "Parlez… puis relâchez."
      : phase === "transcribing"
      ? "Transcription en cours…"
      : "Maintenez le micro pour parler.";

  return (
    <Screen>
      <View style={s.header}>
        <UiText variant="h1" style={{ fontWeight: "900" }}>
          Compagnon
        </UiText>
        <UiText muted>Maintenez le micro, parlez, relâchez.</UiText>
      </View>

      <View style={s.card}>
        <UiText variant="title" style={{ fontWeight: "900" }}>
          Dernière phrase entendue
        </UiText>
        <UiText muted style={{ marginTop: 8 }}>
          {lastText || "—"}
        </UiText>
      </View>

      <Pressable
        onPressIn={startRecording}
        onPressOut={stopRecordingAndProcess}
        style={s.micWrap}
        accessibilityRole="button"
      >
        <View style={s.micInner}>
          <Ionicons name="mic" size={46} color="#fff" />
        </View>
      </Pressable>

      <UiText muted style={s.hint}>
        {hint}
      </UiText>
    </Screen>
  );
}
