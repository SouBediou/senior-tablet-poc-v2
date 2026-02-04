export type ChatPayload = {
    text: string;
    seniorId?: string;
    avatar?: { id?: string; name: string; voiceId?: string };
    triggerType?: "demo_button" | "demo_phrase" | "text";
  };
  
  export type ChatResponse = {
    assistantText: string;
    ttsText: string;
    invocation: { required: boolean; detected: boolean };
    emergency: boolean;
  };
  
  const BASE_URL = "https://whisper-api-xfhp.onrender.com";

  
  export async function postChat(payload: ChatPayload): Promise<ChatResponse> {
    const attempt = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // ✅ 25s
  
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
      // Retry 1 fois si timeout/abort (Render cold start etc.)
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
  
  
  