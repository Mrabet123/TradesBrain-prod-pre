import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// CLAUDE.md Rule 3 / D4 §5.1 — the Supabase session JWT MUST live in the OS
// keychain (Expo SecureStore), never in AsyncStorage (which is unencrypted at
// rest on Android). SecureStore warns above ~2KB per value and a Supabase
// session token can exceed that, so this adapter transparently splits long
// values into chunks stored under sibling keys. Short values are stored
// directly. This also keeps the PKCE code verifier alive — encrypted — across
// the Google OAuth browser round-trip.
const CHUNK_SIZE = 1800;
const CHUNK_PREFIX = '__chunks__:';

function chunkKey(key: string, i: number): string {
  return `${key}.chunk.${i}`;
}

const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const meta = await SecureStore.getItemAsync(key);
    if (meta == null) return null;
    // A short value was stored directly under the key.
    if (!meta.startsWith(CHUNK_PREFIX)) return meta;
    const count = Number(meta.slice(CHUNK_PREFIX.length));
    if (!Number.isFinite(count) || count <= 0) return null;
    let out = '';
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(chunkKey(key, i));
      if (part == null) return null; // corrupt/partial — treat as no session
      out += part;
    }
    return out;
  },
  async setItem(key: string, value: string): Promise<void> {
    // Clear any prior chunks first so a now-shorter value cannot leave stale
    // tail chunks behind.
    await SecureStoreAdapter.removeItem(key);
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(
        chunkKey(key, i),
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );
    }
    await SecureStore.setItemAsync(key, `${CHUNK_PREFIX}${count}`);
  },
  async removeItem(key: string): Promise<void> {
    const meta = await SecureStore.getItemAsync(key);
    if (meta?.startsWith(CHUNK_PREFIX)) {
      const count = Number(meta.slice(CHUNK_PREFIX.length));
      if (Number.isFinite(count)) {
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(chunkKey(key, i)).catch(() => {});
        }
      }
    }
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
};

// expo-secure-store is native-only. On the web build target there is no OS
// keychain, so fall back to AsyncStorage (localStorage) there — the Android
// at-rest-encryption concern this fix addresses does not apply to a browser.
const sessionStorage = Platform.OS === 'web' ? AsyncStorage : SecureStoreAdapter;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // React Native has no localStorage. SecureStore (OS keychain) persists the
    // session so returning users stay signed in (M1) while keeping the JWT
    // encrypted at rest — see the adapter note above.
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    // No URL bar in React Native: the Google OAuth redirect is captured by
    // expo-web-browser and exchanged manually via exchangeCodeForSession
    // (see app/(auth)/signin.tsx). Must stay false.
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
