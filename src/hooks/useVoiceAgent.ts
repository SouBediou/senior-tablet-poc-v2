import { useState, useRef, useCallback, useEffect } from "react";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { BACKEND_URL } from "../config";

// Log au chargement du module
console.log("🔗 [useVoiceAgent] Module chargé, BACKEND_URL =", BACKEND_URL);

export type VoicePhase = "idle" | "listening" | "processing" | "speaking" | "error";

type VoiceAgentConfig = {
  avatarId: string;
  sessionId?: string;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
};

export function useVoiceAgent(config: VoiceAgentConfig) {
  const { avatarId, sessionId = "default", onTranscript, onResponse, onError } = config;

  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isActiveRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    isActiveRef.current = false;
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch {}
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {}
    Speech.stop();
  };

  // Start recording
  const startListening = useCallback(async () => {
    if (phase !== "idle") return;

    try {
      setPhase("listening");
      setTranscript("");
      setResponse("");
      setErrorMsg("");
      isActiveRef.current = true;

      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error("Permission microphone refusée");
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;

      console.log("🎙️ Recording started");
    } catch (error: any) {
      console.error("❌ Start recording error:", error);
      setPhase("error");
      setErrorMsg(error.message || "Erreur microphone");
      onError?.(error);
    }
  }, [phase, onError]);

  // Stop recording and process
  const stopListening = useCallback(async () => {
    if (!recordingRef.current || phase !== "listening") return;

    try {
      setPhase("processing");

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        throw new Error("Pas d'audio enregistré");
      }

      console.log("📁 Audio recorded:", uri);

      // Reset audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Send to backend
      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: "audio/m4a",
        name: "audio.m4a",
      } as any);
      formData.append("avatarId", avatarId);
      formData.append("sessionId", sessionId);

      const fullUrl = `${BACKEND_URL}/voice-chat`;
      console.log("📤 [DEBUG] BACKEND_URL =", BACKEND_URL);
      console.log("📤 [DEBUG] Full URL =", fullUrl);
      console.log("📤 [DEBUG] URL length =", fullUrl.length);
      console.log("📤 [DEBUG] URL charCodes =", [...fullUrl].slice(0, 50).map(c => c.charCodeAt(0)));

      console.log("📤 Sending to backend...");
      const res = await fetch(fullUrl, {
        method: "POST",
        body: formData,
      });

      console.log("📥 [DEBUG] Response status =", res.status);
      console.log("📥 [DEBUG] Response URL =", res.url);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ [DEBUG] Error response body =", text);
        throw new Error(`Erreur serveur: ${res.status} ${text}`);
      }

      const data = await res.json();
      console.log("📥 Backend response:", data);

      // Update state
      setTranscript(data.userText || "");
      setResponse(data.assistantText || "");
      onTranscript?.(data.userText || "");
      onResponse?.(data.assistantText || "");

      // Play audio response
      if (data.audioBase64 && isActiveRef.current) {
        await playAudioResponse(data.audioBase64, data.assistantText);
      } else if (data.assistantText && isActiveRef.current) {
        // Fallback to expo-speech
        await playFallbackSpeech(data.assistantText);
      } else {
        setPhase("idle");
      }

    } catch (error: any) {
      console.error("❌ Process error:", error);
      setPhase("error");
      setErrorMsg(error.message || "Erreur traitement");
      onError?.(error);
    }
  }, [phase, avatarId, sessionId, onTranscript, onResponse, onError]);

  // Play base64 audio
  const playAudioResponse = async (audioBase64: string, text: string) => {
    try {
      setPhase("speaking");

      // Create data URI
      const dataUri = `data:audio/mp3;base64,${audioBase64}`;

      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      // Listen for playback completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPhase("idle");
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

      console.log("🔊 Playing audio response");
    } catch (error) {
      console.error("❌ Audio playback error, using fallback:", error);
      await playFallbackSpeech(text);
    }
  };

  // Fallback TTS with expo-speech
  const playFallbackSpeech = async (text: string) => {
    setPhase("speaking");

    return new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: "fr-FR",
        rate: 0.9,
        onDone: () => {
          setPhase("idle");
          resolve();
        },
        onError: () => {
          setPhase("idle");
          resolve();
        },
      });
    });
  };

  // Cancel current operation
  const cancel = useCallback(async () => {
    await cleanup();
    setPhase("idle");
    setErrorMsg("");
  }, []);

  // Reset session
  const resetSession = useCallback(async () => {
    try {
      await fetch(`${BACKEND_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setTranscript("");
      setResponse("");
    } catch (error) {
      console.error("Reset error:", error);
    }
  }, [sessionId]);

  return {
    phase,
    transcript,
    response,
    errorMsg,
    isListening: phase === "listening",
    isProcessing: phase === "processing",
    isSpeaking: phase === "speaking",
    startListening,
    stopListening,
    cancel,
    resetSession,
  };
}
