// API pour le backend vocal custom (Whisper + Claude + OpenAI TTS)

const BASE_URL = process.env.EXPO_PUBLIC_VOICE_BACKEND_URL || "https://your-backend.onrender.com";

// ============================================
// TYPES
// ============================================
export type ChatPayload = {
  text: string;
  avatarId?: string;
  sessionId?: string;
};

export type ChatResponse = {
  assistantText: string;
  audioBase64?: string;
};

export type VoiceResponse = {
  userText: string;
  assistantText: string;
  audioBase64: string;
  timing?: {
    stt: number;
    llm: number;
    tts: number;
    total: number;
  };
};

// ============================================
// CHAT (texte → Claude → TTS)
// ============================================
export async function postChat(payload: ChatPayload): Promise<ChatResponse> {
  const attempt = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${txt}`);
      }

      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await attempt();
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const isAbort =
      msg.toLowerCase().includes("aborted") ||
      msg.toLowerCase().includes("aborterror");

    if (isAbort) {
      return await attempt();
    }

    throw e;
  }
}

// ============================================
// VOICE (audio → Whisper → Claude → TTS)
// ============================================
export async function postVoice(
  audioUri: string,
  avatarId: string,
  sessionId: string = "default"
): Promise<VoiceResponse> {
  const formData = new FormData();
  formData.append("audio", {
    uri: audioUri,
    type: "audio/m4a",
    name: "audio.m4a",
  } as any);
  formData.append("avatarId", avatarId);
  formData.append("sessionId", sessionId);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(`${BASE_URL}/voice`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${txt}`);
    }

    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================
// RESET SESSION
// ============================================
export async function resetSession(sessionId: string = "default"): Promise<void> {
  await fetch(`${BASE_URL}/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
}

// ============================================
// HEALTH CHECK
// ============================================
export async function checkHealth(): Promise<{ status: string; sessions: number }> {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}
