const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Clients API
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Historique des conversations par session
const sessions = new Map();

// ============================================
// SYSTEM PROMPTS POUR SENIORS
// ============================================
function getSystemPrompt(avatarId) {
  const base = `Tu es un assistant vocal pour personnes âgées à domicile.

RÈGLES CRITIQUES :
- Phrases TRÈS courtes (10-15 mots max)
- Un sujet à la fois
- Reformule si incompréhension
- Jamais de jargon technique
- Toujours bienveillant et patient
- Vérifie la compréhension
- Parle lentement et clairement
- Propose de l'aide concrète

`;

  const personas = {
    femme: base + `Tu es Jeanne, douce et rassurante comme une amie bienveillante.
Exemple de réponse : "Bonjour ! Comment allez-vous aujourd'hui ?"
Tu utilises un ton chaleureux et maternel.`,

    homme: base + `Tu es Paul, calme et posé comme un ami de confiance.
Exemple de réponse : "Bonjour, que puis-je faire pour vous ?"
Tu utilises un ton rassurant et fiable.`,

    dynamique: base + `Tu es Léo, énergique mais doux, comme un jeune aidant attentionné.
Exemple de réponse : "Bonjour ! Je suis prêt à vous aider !"
Tu utilises un ton positif et encourageant.`
  };

  return personas[avatarId] || personas.femme;
}

// ============================================
// ENDPOINT PRINCIPAL : VOIX COMPLÈTE
// ============================================
app.post("/voice", upload.single("audio"), async (req, res) => {
  const totalStart = Date.now();
  const sessionId = req.body.sessionId || "default";
  const avatarId = req.body.avatarId || "femme";

  console.log(`\n🎙️ [VOICE] Nouvelle requête - Session: ${sessionId}, Avatar: ${avatarId}`);

  try {
    // ============================================
    // ÉTAPE 1 : WHISPER (STT)
    // ============================================
    if (!req.file) {
      return res.status(400).json({ error: "Fichier audio requis" });
    }

    console.log(`📁 [STT] Audio reçu: ${req.file.size} bytes, type: ${req.file.mimetype}`);
    const sttStart = Date.now();

    const transcription = await openai.audio.transcriptions.create({
      file: new File([req.file.buffer], "audio.m4a", { type: req.file.mimetype || "audio/m4a" }),
      model: "whisper-1",
      language: "fr",
    });

    const userText = transcription.text.trim();
    console.log(`✅ [STT] Transcrit en ${Date.now() - sttStart}ms: "${userText}"`);

    if (!userText) {
      return res.json({
        userText: "",
        assistantText: "Je n'ai pas bien entendu. Pouvez-vous répéter ?",
        audioBase64: null,
      });
    }

    // ============================================
    // ÉTAPE 2 : CLAUDE (LLM)
    // ============================================
    console.log("🧠 [LLM] Appel Claude...");
    const llmStart = Date.now();

    // Récupérer ou créer l'historique
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    const history = sessions.get(sessionId);

    // Ajouter le message utilisateur
    history.push({ role: "user", content: userText });

    // Garder seulement les 10 derniers messages
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: getSystemPrompt(avatarId),
      messages: history,
    });

    const assistantText = response.content[0]?.text || "Je suis là pour vous aider.";

    // Ajouter la réponse à l'historique
    history.push({ role: "assistant", content: assistantText });

    console.log(`✅ [LLM] Réponse en ${Date.now() - llmStart}ms: "${assistantText}"`);

    // ============================================
    // ÉTAPE 3 : OPENAI TTS
    // ============================================
    console.log("🔊 [TTS] Génération audio...");
    const ttsStart = Date.now();

    const voiceMap = {
      femme: "nova",     // Voix féminine douce
      homme: "onyx",     // Voix masculine grave
      dynamique: "fable" // Voix dynamique narrative
    };

    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voiceMap[avatarId] || "nova",
      input: assistantText,
      speed: 0.95, // Légèrement plus lent pour les seniors
    });

    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    console.log(`✅ [TTS] Audio généré en ${Date.now() - ttsStart}ms (${audioBuffer.length} bytes)`);

    // ============================================
    // RÉPONSE
    // ============================================
    const totalTime = Date.now() - totalStart;
    console.log(`🏁 [VOICE] Total: ${totalTime}ms\n`);

    res.json({
      userText,
      assistantText,
      audioBase64,
      timing: {
        stt: Date.now() - sttStart,
        llm: Date.now() - llmStart,
        tts: Date.now() - ttsStart,
        total: totalTime,
      },
    });

  } catch (error) {
    console.error("❌ [VOICE] Erreur:", error);
    res.status(500).json({
      error: error.message || "Erreur serveur",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// ============================================
// ENDPOINT TEXTE (fallback sans audio)
// ============================================
app.post("/chat", async (req, res) => {
  const { text, avatarId = "femme", sessionId = "default" } = req.body;

  console.log(`\n💬 [CHAT] "${text}" - Avatar: ${avatarId}`);

  try {
    if (!text) {
      return res.status(400).json({ error: "Texte requis" });
    }

    // Historique
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    const history = sessions.get(sessionId);
    history.push({ role: "user", content: text });

    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    // Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: getSystemPrompt(avatarId),
      messages: history,
    });

    const assistantText = response.content[0]?.text || "Je suis là pour vous aider.";
    history.push({ role: "assistant", content: assistantText });

    // TTS
    const voiceMap = { femme: "nova", homme: "onyx", dynamique: "fable" };

    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voiceMap[avatarId] || "nova",
      input: assistantText,
      speed: 0.95,
    });

    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    res.json({ assistantText, audioBase64 });

  } catch (error) {
    console.error("❌ [CHAT] Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RESET SESSION
// ============================================
app.post("/reset", (req, res) => {
  const { sessionId = "default" } = req.body;
  sessions.delete(sessionId);
  console.log(`🔄 [RESET] Session ${sessionId} effacée`);
  res.json({ success: true });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    sessions: sessions.size,
  });
});

// ============================================
// START
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Voice Agent Backend running on port ${PORT}`);
  console.log(`   - POST /voice  (audio → STT → Claude → TTS → audio)`);
  console.log(`   - POST /chat   (text → Claude → TTS → audio)`);
  console.log(`   - POST /reset  (clear session)`);
  console.log(`   - GET  /health`);
});
