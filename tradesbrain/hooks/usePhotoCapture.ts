import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getCompressionSettings } from '../utils/imageCompression';

export function usePhotoCapture() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const capturePhoto = async (stage: number): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;

    const settings = getCompressionSettings(stage);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: settings.quality,
      allowsEditing: false,
    });

    if (result.canceled) return null;
    const uri = result.assets[0].uri;
    setPhotoUri(uri);
    return uri;
  };

  return { photoUri, capturePhoto, setPhotoUri };
}
