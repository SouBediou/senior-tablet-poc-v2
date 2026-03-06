import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const EMBED_URL = 'https://embed.liveavatar.com/v1/0613e60f-b265-4b2d-9b58-e8be2d0e3854';

interface Props {
  isSandbox?: boolean;
  seniorName?: string;
}

export default function LiveAvatarEmbed({ isSandbox, seniorName }: Props) {
  return (
    <WebView
      source={{ uri: EMBED_URL }}
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
});