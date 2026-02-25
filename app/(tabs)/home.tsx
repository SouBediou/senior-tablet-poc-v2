import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { WebView } from "react-native-webview";

import { Screen } from "@/src/components/Screen";
import { useTheme } from "@/src/ui/useTheme";
import { ActionCard } from "@/src/components/ActionCard";
import { UiText } from "@/src/components/UiText";
import { useProfile } from '@/src/hooks/useProfile';
import { DID_AGENT_ID, DID_CLIENT_KEY } from "@/src/config";

export default function HomeScreen() {
  const t = useTheme();
  const { height } = useWindowDimensions();
  const avatarHeight = height * 0.5;
  const { profile, loaded } = useProfile();
  const s = StyleSheet.create({
    avatarContainer: {
      height: avatarHeight,
      borderRadius: t.radius.xl,
      overflow: "hidden",
      backgroundColor: "#000",
    },
    webview: {
      flex: 1,
    },
    section: {
      marginTop: t.spacing.lg,
      gap: t.spacing.md,
    },
    gridRow: {
      flexDirection: "row",
      gap: t.spacing.md,
    },
    col: {
      flex: 1,
    },
  });

  const profileContext = loaded && profile.prenom ? `
Tu parles à ${profile.prenom}, ${profile.age} ans${profile.ville ? `, qui habite à ${profile.ville}` : ''}.
${profile.enfants ? `Ses enfants s'appellent : ${profile.enfants}.` : ''}
${profile.profession ? `Il/Elle était ${profile.profession}.` : ''}
${profile.interets ? `Ses centres d'intérêt : ${profile.interets}.` : ''}
Appelle-le/la par son prénom. Sois chaleureuse et personnelle.
` : '';

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; width: 100vw; height: 100vh; overflow: hidden; }
    #agent-video { width: 100%; height: 100%; object-fit: cover; }
    #status { position: absolute; top: 10px; left: 10px; color: white; font-size: 12px; font-family: sans-serif; }
    #mic-btn {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: #fff;
      border: none;
      border-radius: 50px;
      padding: 16px 40px;
      font-size: 22px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
    #mic-btn.listening {
      background: #ff4444;
      color: white;
    }
    #mic-btn.speaking {
      background: #4CAF50;
      color: white;
    }
  </style>
</head>
<body>
  <video id="agent-video" autoplay playsinline></video>
  <div id="status">Connexion...</div>
  <button id="mic-btn">Parler à Jeanne</button>

  <script type="module">
    import * as did from 'https://cdn.jsdelivr.net/npm/@d-id/client-sdk@1.1.9/+esm';

    const agentId = "${DID_AGENT_ID}";
    const clientKey = "${DID_CLIENT_KEY}";
    const status = document.getElementById('status');
    const videoElement = document.getElementById('agent-video');
    const micBtn = document.getElementById('mic-btn');
    let agent;
    let isSpeaking = false;

    const callbacks = {
      onSrcObjectReady(value) {
        videoElement.srcObject = value;
      },
      onVideoStateChange(state) {
      console.log('video state:', state);
        if (state === 'talking') {
          isSpeaking = true;
          micBtn.classList.add('speaking');
          micBtn.textContent = '⏹ Arrêter';
        } else {
          isSpeaking = false;
          micBtn.classList.remove('speaking');
          micBtn.textContent = 'Parler à Jeanne';
        }
      },
      onConnectionStateChange(state) {
        status.textContent = state === 'connected' ? '' : state;
      },
      onNewMessage(messages, type) {
        console.log('Message:', messages);
      },
      onError(error) {
        status.textContent = 'Erreur: ' + error.message;
      }
    };

    try {
      status.textContent = 'Création agent...';
      agent = await did.createAgentManager(agentId, {
        auth: { type: 'key', clientKey },
        callbacks
      });
      status.textContent = 'Connexion...';
      await agent.connect();
      status.textContent = '';
      await agent.chat("Contexte confidentiel sur la personne avec qui tu parles (ne révèle pas ces infos directement) : ${profileContext}. Quand on te parlera, utilise ces informations naturellement dans la conversation.");
    } catch(e) {
      status.textContent = 'Erreur: ' + e.message;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;

    micBtn.addEventListener('click', async () => {
      if (isSpeaking) {
        await agent.speak({ type: 'text', input: '' });
        isSpeaking = false;
        micBtn.classList.remove('speaking');
        micBtn.textContent = 'Parler à Jeanne';
        return;
      }
      micBtn.classList.add('listening');
      micBtn.textContent = 'Écoute...';
      recognition.start();
    });

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      micBtn.classList.remove('listening');
      micBtn.textContent = 'Parler à Jeanne';
      status.textContent = transcript;
      await agent.chat(transcript);
    };

    recognition.onerror = () => {
      micBtn.classList.remove('listening');
      micBtn.textContent = 'Parler à Jeanne';
      status.textContent = '';
    };

    recognition.onend = () => {
      micBtn.classList.remove('listening');
      if (!isSpeaking) micBtn.textContent = 'Parler à Jeanne';
    };
  </script>
</body>
</html>
`;

  return (
    <Screen>
      {/* Avatar D-ID 50% */}
      <View style={s.avatarContainer}>
        <WebView
          style={s.webview}
          source={{ html, baseUrl: 'https://studio.d-id.com' }}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          mediaCapturePermissionGrantType="grant"
          onPermissionRequest={(request: any) => request.grant(request.resources)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
        />
      </View>

      {/* Accès rapides */}
      <View style={s.section}>
        <UiText variant="small" style={{ fontWeight: "900", color: t.colors.muted }}>
          Accès rapide
        </UiText>

        <View style={s.gridRow}>
          <View style={s.col}>
                  <ActionCard
          title="Contacts"
          subtitle="Famille & soignants"
          icon="people-outline"
          color="#eaeaf7"
          onPress={() => router.push("/(tabs)/comm")}
        />
          </View>
          <View style={s.col}>
          <ActionCard title="Jeux" subtitle="Memory, puzzle, quiz" icon="game-controller-outline" color="#a7aac9" onPress={() => router.push("/(tabs)/games")} />
          </View>
        </View>

        <View style={s.gridRow}>
          <View style={s.col}>
          <ActionCard title="Agenda" subtitle="Rappels & visites" icon="calendar-outline" color="#a7aac9" onPress={() => router.push("/(tabs)/agenda")} />
          </View>
          <View style={s.col}>
          <ActionCard title="Urgence" subtitle="Télé-assistance" icon="alert-circle-outline" color="#eaeaf7" onPress={() => router.push("/(tabs)/emergency")} />
          </View>
        </View>
      </View>
    </Screen>
  );
}