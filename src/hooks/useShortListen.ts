import { useCallback, useEffect, useRef, useState } from "react";
import Voice from "@dev-amirzubair/react-native-voice";

type VoiceStatus = "idle" | "listening" | "error";

export function useShortListen() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");

  const currentRef = useRef<string>("");
  const resolveRef = useRef<((text: string) => void) | null>(null);
  const rejectRef = useRef<((err: Error) => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const finalize = useCallback((text: string) => {
    clearTimer();
    setStatus("idle");
    const resolve = resolveRef.current;
    resolveRef.current = null;
    rejectRef.current = null;
    resolve?.(text);
  }, []);

  const fail = useCallback((err: Error) => {
    clearTimer();
    setStatus("error");
    const reject = rejectRef.current;
    resolveRef.current = null;
    rejectRef.current = null;
    reject?.(err);
  }, []);

  const stopListening = useCallback(async () => {
    try {
      clearTimer();
      await Voice.stop();
      await Voice.cancel();
    } catch {
      // noop
    }
  }, []);

  const startListening = useCallback(
    async ({ timeoutMs = 12000, locale = "fr-FR" }: { timeoutMs?: number; locale?: string } = {}) => {
      if (status === "listening") return transcript;

      setTranscript("");
      currentRef.current = "";
      setStatus("listening");

      return new Promise<string>(async (resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;

        try {
          Voice.onSpeechPartialResults = (e: any) => {
            const text = (e?.value?.[0] ?? "").trim();
            if (text) {
              currentRef.current = text;
              setTranscript(text);
            }
          };

          Voice.onSpeechResults = (e: any) => {
            const text = (e?.value?.[0] ?? "").trim();
            if (text) {
              currentRef.current = text;
              setTranscript(text);
            }
          };

          Voice.onSpeechEnd = () => {
            finalize((currentRef.current || "").trim());
          };

          Voice.onSpeechError = (e: any) => {
            const msg = e?.error?.message ?? "Erreur de reconnaissance vocale";
            fail(new Error(msg));
          };

          await Voice.start(locale);

          clearTimer();
          timerRef.current = setTimeout(async () => {
            try {
              await stopListening();
            } finally {
              finalize((currentRef.current || "").trim());
            }
          }, timeoutMs);
        } catch (e: any) {
          fail(new Error(e?.message ?? String(e)));
        }
      });
    },
    [fail, finalize, status, stopListening, transcript]
  );

  useEffect(() => {
    return () => {
      clearTimer();
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
    };
  }, []);

  return {
    status,
    transcript,
    startListening,
    stopListening,
    isReady: status !== "listening",
  };
}
