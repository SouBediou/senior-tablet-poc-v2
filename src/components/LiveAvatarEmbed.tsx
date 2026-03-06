import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { UiText } from '@/src/components/UiText';

const BACKEND_URL = 'https://voice-agent-backend-g3pb.onrender.com';

interface Props {
  isSandbox?: boolean;
}

interface SessionData {
  livekit_url: string;
  livekit_client_token: string;
}

function buildHtml(livekitUrl: string, token: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; font-family: sans-serif; }
  #video-container { width: 100%; height: 100%; position: relative; }
  video { width: 100%; height: 100%; object-fit: cover; display: block; }
  #controls {
    position: absolute;
    bottom: 20px;
    left: 0; right: 0;
    display: flex;
    justify-content: center;
    gap: 16px;
  }
  #mic-btn {
    width: 64px; height: 64px;
    border-radius: 50%;
    border: none;
    background: #ffce36;
    font-size: 28px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }
  #mic-btn.muted { background: rgba(255,255,255,0.2); }
  #stop-btn {
    width: 64px; height: 64px;
    border-radius: 50%;
    border: none;
    background: rgba(255,60,60,0.85);
    font-size: 28px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }
  #status {
    position: absolute;
    top: 12px; left: 0; right: 0;
    text-align: center;
    color: rgba(255,255,255,0.5);
    font-size: 12px;
  }
</style>
</head>
<body>
<div id="video-container">
  <div id="status">Connexion...</div>
  <div id="controls">
    <button id="mic-btn" onclick="toggleMic()">🎤</button>
    <button id="stop-btn" onclick="stopSession()">✕</button>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js"></script>
<script>
let room;
let micEnabled = false;
let localMicTrack = null;

async function stopSession() {
  if (room) {
    await room.localParticipant.setMicrophoneEnabled(false);
    await room.disconnect();
  }
  document.getElementById('video-container').innerHTML = '<div style="color:white;text-align:center;padding-top:40%;font-size:14px;">Session terminée</div>';
}

async function toggleMic() {
  const btn = document.getElementById('mic-btn');
  if (!room) return;
  if (!micEnabled) {
    await room.localParticipant.setMicrophoneEnabled(true);
    micEnabled = true;
    btn.textContent = '🔴';
    btn.classList.remove('muted');
    document.getElementById('status').textContent = 'En écoute...';
  } else {
    await room.localParticipant.setMicrophoneEnabled(false);
    micEnabled = false;
    btn.textContent = '🎤';
    btn.classList.add('muted');
    document.getElementById('status').textContent = 'Micro coupé';
  }
}

(async () => {
  room = new LivekitClient.Room({
    adaptiveStream: true,
    dynacast: true,
  });

  room.on(LivekitClient.RoomEvent.TrackSubscribed, (track) => {
    const container = document.getElementById('video-container');
    if (track.kind === 'video') {
      const el = track.attach();
      el.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;';
      container.insertBefore(el, container.firstChild);
    }
    if (track.kind === 'audio') {
      const el = track.attach();
      document.body.appendChild(el);
    }
  });

  room.on(LivekitClient.RoomEvent.Connected, () => {
    document.getElementById('status').textContent = 'Appuyez sur 🎤 pour parler';
  });

  room.on(LivekitClient.RoomEvent.Disconnected, () => {
    document.getElementById('status').textContent = 'Déconnecté';
  });

  await room.connect('${livekitUrl}', '${token}');
})();
</script>
</body>
</html>`;
}

export default function LiveAvatarEmbed({ isSandbox = true }: Props) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function startSession() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/liveavatar/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isSandbox }),
        });
        const data = await res.json();
        if (!cancelled) {
          if (data.livekit_url) setSession(data);
          else setError(data.error?.message || 'Erreur session');
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    startSession();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#ffce36" size="large" />
        <UiText style={s.loadingText}>Connexion à Jeanne...</UiText>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={s.center}>
        <UiText style={s.errorText}>⚠ {error || 'Erreur inconnue'}</UiText>
      </View>
    );
  }

  return (
    <WebView
      source={{ html: buildHtml(session.livekit_url, session.livekit_client_token) }}
      style={s.webview}
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback={true}
      mediaCapturePermissionGrantType="grant"
      onPermissionRequest={(request: any) => request.grant(request.resources)}
    />
  );
}

const s = StyleSheet.create({
  webview: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  errorText: { color: 'rgba(255,100,100,0.8)', fontSize: 12, textAlign: 'center', padding: 16 },
});