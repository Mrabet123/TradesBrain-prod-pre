// D2 F8 / D6 Flow10 — Profile settings.
// Editable: full_name · company_name · hourly_rate · phone_number · company_logo.
// Locked (RULE 1): vat_number · license_number · license_proof_url · national_id_url.
// KYC status badge per document with a "Verify identity" CTA that opens the
// Stripe Identity hosted flow (kyc-status-check mints the session + hosted URL).
// beforeRemove navigation listener fires the unsaved-changes prompt
// (Save · Discard · Keep editing).

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as WebBrowser from 'expo-web-browser';
import type { RootStackParamList } from '../_layout';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { uploadKycPhoto } from '../../services/auth';
import { checkKycStatus } from '../../services/stripe';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Rough byte size of a base64 payload (4 base64 chars ≈ 3 bytes).
function estimateBytes(base64: string): number {
  return Math.floor(base64.length * 0.75);
}

interface ProfileForm {
  fullName: string;
  companyName: string;
  hourlyRate: string;
  phone: string;
  companyLogoUri: string | null;
}

interface ProfileLocked {
  vatNumber: string;
  licenseNumber: string;
  licenseKycStatus: string;
  nationalIdKycStatus: string;
  licenseKycReason: string | null;
  nationalIdKycReason: string | null;
  email: string;
}

export default function ProfileSettingsScreen() {
  const nav = useNavigation<Nav>();
  const { user } = useAuthContext();

  const [form, setForm] = useState<ProfileForm | null>(null);
  const [locked, setLocked] = useState<ProfileLocked | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [verifying, setVerifying] = useState<'license' | 'national_id' | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('users')
      .select(
        'full_name, email, company_name, hourly_rate, phone_number, company_logo_url, vat_number, license_number, license_kyc_status, national_id_kyc_status, license_kyc_reason, national_id_kyc_reason',
      )
      .eq('id', user.id)
      .single();
    if (data) {
      setForm({
        fullName: data.full_name,
        companyName: data.company_name ?? '',
        hourlyRate: String(data.hourly_rate ?? ''),
        phone: data.phone_number,
        companyLogoUri: data.company_logo_url,
      });
      setLocked({
        vatNumber: data.vat_number,
        licenseNumber: data.license_number,
        licenseKycStatus: data.license_kyc_status,
        nationalIdKycStatus: data.national_id_kyc_status,
        licenseKycReason: data.license_kyc_reason ?? null,
        nationalIdKycReason: data.national_id_kyc_reason ?? null,
        email: data.email,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Unsaved-changes prompt (D3 F7)
  useEffect(() => {
    const unsub = nav.addListener('beforeRemove', (e) => {
      if (!dirty || saving) return;
      e.preventDefault();
      Alert.alert(
        'Unsaved changes',
        'You have unsaved changes — save or discard?',
        [
          { text: 'Keep editing' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setDirty(false);
              nav.dispatch(e.data.action);
            },
          },
          {
            text: 'Save',
            onPress: async () => {
              await save();
              nav.dispatch(e.data.action);
            },
          },
        ],
      );
    });
    return unsub;
  }, [nav, dirty, saving]);

  function patch(p: Partial<ProfileForm>) {
    setForm((prev) => (prev ? { ...prev, ...p } : prev));
    setDirty(true);
  }

  async function pickLogo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    // D2 F8 edge (3.2.3) — auto-compress the logo; if it's still oversized after
    // an aggressive pass, surface "Image too large" instead of failing the save.
    const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB is plenty for a logo
    try {
      let out = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 512 } }],
        { compress: 0.7, base64: true, format: ImageManipulator.SaveFormat.JPEG },
      );
      if (estimateBytes(out.base64 ?? '') > LOGO_MAX_BYTES) {
        out = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 384 } }],
          { compress: 0.5, base64: true, format: ImageManipulator.SaveFormat.JPEG },
        );
      }
      if (estimateBytes(out.base64 ?? '') > LOGO_MAX_BYTES) {
        Alert.alert('Image too large', 'Please choose a smaller image for your logo.');
        return;
      }
      patch({ companyLogoUri: out.uri });
    } catch {
      // Manipulation unavailable on this device — fall back to the original.
      patch({ companyLogoUri: uri });
    }
  }

  async function save() {
    if (!user || !form || saving) return;
    setSaving(true);
    try {
      let logoPath = form.companyLogoUri;
      // If a new local URI was picked (file://), upload it to storage.
      if (form.companyLogoUri && form.companyLogoUri.startsWith('file:')) {
        logoPath = await uploadKycPhoto(user.id, 'company_logo', form.companyLogoUri);
      }
      const { error } = await supabase
        .from('users')
        .update({
          full_name: form.fullName.trim(),
          company_name: form.companyName.trim() || null,
          hourly_rate: parseFloat(form.hourlyRate) || 0,
          phone_number: form.phone.trim(),
          company_logo_url: logoPath,
        })
        .eq('id', user.id);
      if (error) throw error;
      setDirty(false);
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  // RULE 5 — kyc-status-check mints a fresh Stripe Identity session for the
  // document and returns its hosted verification URL. The user completes the
  // document capture on Stripe's page; kyc-webhook updates the status fields.
  async function verifyIdentity(kind: 'license' | 'national_id') {
    if (!user || verifying) return;
    setVerifying(kind);
    try {
      const res = await checkKycStatus(kind);
      if (!res.success) throw new Error(res.error ?? 'Could not start verification.');
      const url: string | undefined = res.data?.verification_url ?? undefined;
      if (!url) throw new Error('No verification link was returned. Please try again.');
      // In-app browser — resolves when the user closes it; status is updated
      // server-side by kyc-webhook, so re-read the profile afterwards.
      await WebBrowser.openBrowserAsync(url);
      await reload();
    } catch (e: any) {
      Alert.alert('Verification failed', e?.message ?? 'Unknown error');
    } finally {
      setVerifying(null);
    }
  }

  if (loading || !form || !locked) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAwareScreen bottomInset={96} contentContainerClassName="px-5">
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => nav.goBack()} hitSlop={8}>
          <Text className="text-brand text-base">← Back</Text>
        </Pressable>
        <Text className="text-base font-semibold">Profile</Text>
        <Pressable
          onPress={save}
          disabled={!dirty || saving}
          className={`px-3 py-1.5 rounded-lg ${
            !dirty || saving ? 'bg-gray-200' : 'bg-brand'
          }`}
        >
          <Text className={`${!dirty || saving ? 'text-gray-500' : 'text-white'} font-semibold text-sm`}>
            {saving ? 'Saving…' : 'Save'}
          </Text>
        </Pressable>
      </View>

      {/* Editable fields */}
      <FieldLabel>Full name</FieldLabel>
      <TextInput
        value={form.fullName}
        onChangeText={(t) => patch({ fullName: t })}
        placeholderTextColor="#9CA3AF"
        className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
      />

      <FieldLabel>Company name (optional)</FieldLabel>
      <TextInput
        value={form.companyName}
        onChangeText={(t) => patch({ companyName: t })}
        placeholderTextColor="#9CA3AF"
        className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
      />

      <FieldLabel>Hourly rate (USD)</FieldLabel>
      <TextInput
        value={form.hourlyRate}
        onChangeText={(t) => patch({ hourlyRate: t })}
        keyboardType="decimal-pad"
        placeholderTextColor="#9CA3AF"
        className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
      />

      <FieldLabel>Phone number</FieldLabel>
      <TextInput
        value={form.phone}
        onChangeText={(t) => patch({ phone: t })}
        keyboardType="phone-pad"
        placeholderTextColor="#9CA3AF"
        className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
      />

      <FieldLabel>Company logo (optional)</FieldLabel>
      <Pressable
        onPress={pickLogo}
        className="border border-dashed border-gray-300 rounded-lg p-3 mb-4 items-center justify-center min-h-[100px]"
      >
        {form.companyLogoUri ? (
          <Image
            source={{ uri: form.companyLogoUri }}
            className="w-24 h-24 rounded-md"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-gray-500">Tap to upload logo</Text>
        )}
      </Pressable>

      {/* Locked block */}
      <Text className="text-xs uppercase text-gray-500 font-medium mt-2 mb-2">
        Permanently locked
      </Text>

      <LockedRow label="Email" value={locked.email} />
      <LockedRow label="VAT number" value={locked.vatNumber} />
      <LockedRow label="License number" value={locked.licenseNumber} />

      {/* KYC documents */}
      <View className="mt-3">
        <KycRow
          label="National ID"
          status={locked.nationalIdKycStatus}
          reason={locked.nationalIdKycReason}
          busy={verifying === 'national_id'}
          onVerify={() => verifyIdentity('national_id')}
        />
        <KycRow
          label="License proof"
          status={locked.licenseKycStatus}
          reason={locked.licenseKycReason}
          busy={verifying === 'license'}
          onVerify={() => verifyIdentity('license')}
        />
      </View>
    </KeyboardAwareScreen>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text className="text-sm font-medium text-gray-700 mb-1">{children}</Text>;
}

function LockedRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 mb-2">
      <View className="flex-1">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="text-sm text-gray-800">{value || '—'}</Text>
      </View>
      <Text className="text-base">🔒</Text>
    </View>
  );
}

function KycRow({
  label,
  status,
  reason,
  busy,
  onVerify,
}: {
  label: string;
  status: string;
  reason?: string | null;
  busy: boolean;
  onVerify: () => void;
}) {
  const map: Record<
    string,
    { tone: string; color: string; copy: string; cta: string | null }
  > = {
    verified: {
      tone: 'bg-green-50 border-green-200',
      color: 'text-green-700',
      copy: 'Verified · permanently locked',
      cta: null,
    },
    pending: {
      tone: 'bg-amber-50 border-amber-200',
      color: 'text-amber-700',
      copy: "Under review · we'll update this once Stripe finishes",
      cta: 'Continue verification',
    },
    rejected: {
      tone: 'bg-red-50 border-red-200',
      color: 'text-red-700',
      copy: 'Rejected · re-verify to continue',
      cta: 'Re-verify identity',
    },
    not_uploaded: {
      tone: 'bg-gray-50 border-gray-200',
      color: 'text-gray-700',
      copy: 'Not verified yet',
      cta: 'Verify identity',
    },
  };
  const m = map[status] ?? map.not_uploaded;
  return (
    <View className={`border rounded-lg px-3 py-3 mb-2 ${m.tone}`}>
      <View className="flex-row items-center justify-between">
        <Text className={`text-sm font-semibold ${m.color}`}>{label}</Text>
        {status === 'verified' && <Text className="text-base">🔒</Text>}
      </View>
      <Text className={`text-xs ${m.color}`}>{m.copy}</Text>
      {/* D9 (3.4.2) — show Stripe's rejection reason when the document failed. */}
      {status === 'rejected' && reason ? (
        <Text className={`text-xs mt-1 ${m.color}`}>Reason: {reason}</Text>
      ) : null}
      {m.cta && (
        <Pressable
          onPress={onVerify}
          disabled={busy}
          className={`mt-2 py-2 rounded-lg border border-brand ${busy ? 'opacity-50' : ''}`}
        >
          <Text className="text-center text-brand font-semibold text-sm">
            {busy ? 'Opening…' : m.cta}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
