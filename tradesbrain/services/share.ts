// services/share.ts — native share sheet for generated PDFs and photos.
// Uses expo-sharing on native (handles file:// URIs on Android), falls back to
// React Native's Share API on iOS when expo-sharing is unavailable.

import { Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
// Use the legacy entrypoint because the new Paths/File API does not yet
// expose `cacheDirectory` + `downloadAsync` in a TS-friendly way.
import * as FileSystem from 'expo-file-system/legacy';

export async function sharePdf(localUri: string, title = 'Job document'): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(localUri, {
      mimeType: 'application/pdf',
      dialogTitle: title,
      UTI: 'com.adobe.pdf',
    });
    return;
  }
  if (Platform.OS === 'ios') {
    await Share.share({ url: localUri, title });
  } else {
    await Share.share({ message: localUri, title });
  }
}

// Share a single photo URI (local file:// or remote https://). Remote URLs are
// downloaded to a temp file first so the share sheet can pass the bytes to
// other apps. Used by the Photos tab "Download all" loop.
export async function sharePhoto(uri: string, title = 'Job photo'): Promise<void> {
  let localUri = uri;
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const ext = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
    const dest = `${FileSystem.cacheDirectory}share-${Date.now()}.${ext}`;
    const dl = await FileSystem.downloadAsync(uri, dest);
    localUri = dl.uri;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(localUri, {
      mimeType: 'image/jpeg',
      dialogTitle: title,
      UTI: 'public.image',
    });
    return;
  }
  if (Platform.OS === 'ios') {
    await Share.share({ url: localUri, title });
  } else {
    await Share.share({ message: localUri, title });
  }
}
