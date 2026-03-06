require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const conversations = new Map();

function safeUnlink(p) {
  try {
    if (p && fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
}

// ─── Health Check ────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Voice Agent Backend - Whisper + Claude + OpenAI TTS",
    services: {
      openai: !!openai,
      anthropic: !!anthropic,
      liveavatar: !!process.env.LIVEAVATAR_API_KEY,
    },
  });
});

// ─── LiveAvatar Session ──────────────────────────────
app.post("/api/liveavatar/session", async (req, res) => {
  console.log("🎭 [LIVEAVATAR] Création session...");
  try {
    const { isSandbox = true } = req.body;

    const AVATAR_ID_PROD    = "9231e824-5501-4c99-881f-6f3a88fcbdf0";
    const AVATAR_ID_SANDBOX = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";

    // 1. Créer le token de session
    const tokenRes = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.LIVEAVATAR_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: isSandbox ? AVATAR_ID_SANDBOX : AVATAR_ID_PROD,
        is_sandbox: isSandbox,
        avatar_persona: {
          language: "fr",
        },
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("🎭 [LIVEAVATAR] Token response:", JSON.stringify(tokenData));

    if (!tokenRes.ok) {
      return res.status(500).json({ error: tokenData });
    }

    const { session_id, session_token } = tokenData;

    // 2. Démarrer la session
    const startRes = await fetch("https://api.liveavatar.com/v1/sessions/start", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.LIVEAVATAR_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ session_id }),
    });

    const startData = await startRes.json();
    console.log("🎭 [LIVEAVATAR] Start response:", JSON.stringify(startData));

    if (!startRes.ok) {
      return res.status(500).json({ error: startData });
    }

    console.log("✅ [LIVEAVATAR] Session créée:", session_id);

    res.json({
      session_id,
      session_token,
      livekit_url: startData.livekit_url,
      livekit_client_token: startData.livekit_client_token,
    });

  } catch (e) {
    console.error("❌ [LIVEAVATAR] Erreur:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── Voice Chat ──────────────────────────────────────
app.post("/voice-chat", upload.single("audio"), async (req, res) => {
  const startTime = Date.now();
  console.log("🎤 [VOICE-CHAT] Nouvelle requête reçue");

  try {
    if (!openai) return res.status(400).json({ error: "OPENAI_API_KEY missing" });
    if (!anthropic) return res.status(400).json({ error: "ANTHROPIC_API_KEY missing" });

    const audioFile = req.file;
    const sessionId = req.body.sessionId || "default";
    const avatarId = req.body.avatarId || "femme";

    if (!audioFile) return res.status(400).json({ error: "Fichier audio manquant" });

    if (audioFile.size < 100) {
      safeUnlink(audioFile.path);
      return res.status(400).json({ error: "Fichier audio trop petit (< 100 bytes)" });
    }

    console.log("📝 [STT] Transcription...");
    const transcriptionStart = Date.now();
    const originalPath = audioFile.path;
    const newPath = originalPath + ".m4a";
    fs.renameSync(originalPath, newPath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(newPath),
      model: "whisper-1",
      language: "fr",
    });

    const userText = transcription.text;
    console.log(`✅ [STT] ${Date.now() - transcriptionStart}ms: "${userText}"`);

    console.log("🤖 [LLM] Génération réponse...");
    const claudeStart = Date.now();

    if (!conversations.has(sessionId)) conversations.set(sessionId, []);
    const history = conversations.get(sessionId);

    const messages = [...history, { role: "user", content: userText }];
    const systemPrompt = getSystemPrompt(avatarId);

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages,
    });

    const assistantText = response.content[0].text;
    console.log(`✅ [LLM] ${Date.now() - claudeStart}ms: "${assistantText}"`);

    history.push({ role: "user", content: userText }, { role: "assistant", content: assistantText });
    if (history.length > 10) history.splice(0, history.length - 10);

    console.log("🔊 [TTS] Génération audio...");
    const ttsStart = Date.now();

    const voiceMap = { femme: "nova", homme: "onyx", dynamique: "fable" };

    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voiceMap[avatarId] || "nova",
      input: assistantText,
      speed: 0.95,
    });

    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    console.log(`✅ [TTS] Audio généré en ${Date.now() - ttsStart}ms`);

    safeUnlink(req.file.path);
    safeUnlink(req.file.path + ".m4a");

    const totalTime = Date.now() - startTime;
    console.log(`✅ [VOICE-CHAT] Total: ${totalTime}ms`);

    res.json({
      success: true,
      userText,
      assistantText,
      audioBase64,
      timing: {
        total: totalTime,
        transcription: Date.now() - transcriptionStart,
        llm: Date.now() - claudeStart,
        tts: Date.now() - ttsStart,
      },
    });
  } catch (error) {
    console.error("❌ [VOICE-CHAT] Erreur:", error?.message || error);
    if (req.file) {
      safeUnlink(req.file.path);
      safeUnlink(req.file.path + ".m4a");
    }
    res.status(500).json({ error: error?.message || "unknown_error" });
  }
});

// ─── Prompts système ─────────────────────────────────
function getSystemPrompt(avatarId) {
  const prompts = {
    femme: `Tu es Jeanne, une assistante vocale bienveillante et patiente. Tu aides des personnes âgées à domicile. Tu réponds en langue française.

Règles importantes :
- Parle avec une voix douce et rassurante
- Phrases courtes et claires (max 2-3 phrases)
- Répète si nécessaire sans montrer d'impatience
- Ton chaleureux et encourageant
- Évite le jargon technique
- Vérifie toujours la compréhension`,
    homme: `Tu es Paul, un assistant vocal calme et rassurant. Tu accompagnes des seniors à domicile.

Règles importantes :
- Voix posée et claire
- Phrases simples et directes
- Patient et respectueux
- Encourage l'autonomie`,
    dynamique: `Tu es Léo, un assistant vocal énergique mais doux. Tu soutiens des personnes âgées au quotidien.

Règles importantes :
- Ton positif et motivant
- Phrases courtes et rythmées
- Enthousiaste sans être trop rapide`,
  };
  return prompts[avatarId] || prompts.femme;
}

// ─── Nettoyage sessions ──────────────────────────────
setInterval(() => {
  for (const [sessionId, history] of conversations.entries()) {
    if (!history || history.length === 0) conversations.delete(sessionId);
  }
  console.log(`🧹 Nettoyage - Sessions actives: ${conversations.size}`);
}, 3600000);

// ─── Démarrage ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur le port ${PORT}`);
  console.log(`✅ OpenAI: ${openai ? "Configuré" : "❌ Manquant"}`);
  console.log(`✅ Claude: ${anthropic ? "Configuré" : "❌ Manquant"}`);
  console.log(`✅ LiveAvatar: ${process.env.LIVEAVATAR_API_KEY ? "Configuré" : "❌ Manquant"}`);
});