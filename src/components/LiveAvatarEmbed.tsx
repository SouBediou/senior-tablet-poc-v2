import React, { useMemo } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';

const AVATAR_BASE_URL =
  'https://embed.liveavatar.com/v1/9231e824-5501-4c99-881f-6f3a88fcbdf0';

interface Props {
  seniorName?: string;
  weatherContext?: string;
  agendaContext?: string;
}

export default function LiveAvatarEmbed({ seniorName, weatherContext, agendaContext }: Props) {
  const embedUrl = useMemo(() => {
    const parts: string[] = [];
    if (seniorName)     parts.push(`Vous parlez avec ${seniorName}.`);
    if (weatherContext) parts.push(weatherContext);
    if (agendaContext)  parts.push(agendaContext);
    if (parts.length === 0) return AVATAR_BASE_URL;
    return `${AVATAR_BASE_URL}?context=${encodeURIComponent(parts.join(' '))}`;
  }, [seniorName, weatherContext, agendaContext]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webview}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        mediaCapturePermissionGrantType="grant"
        onPermissionRequest={(request: any) => request.grant(request.resources)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview:   { flex: 1, backgroundColor: '#000' },
});