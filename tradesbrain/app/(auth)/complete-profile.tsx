// Post-OAuth / post-phone-OTP onboarding. Reached via the RootLayout gate when
// a signed-in user has no public.users row yet (Google or phone-OTP sign-up).
// Collects the trade + KYC fields the auth provider doesn't give us, then calls
// createUserProfile() — which creates the users row and clears the gate.

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { supabase } from '../../services/supabase';
import { createUserProfile, deleteAccountFully, type SignUpInput } from '../../services/auth';
import { useAuthContext } from '../../context/AuthContext';
import TermsOverlay from '../../components/shared/TermsOverlay';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import {
  Field,
  RadioRow,
  PhotoPicker,
  pickImage,
  TRADES,
  ACCOUNT_TYPES,
  type TradeType,
  type AccountType,
} from '../../components/shared/ProfileFormFields';

export default function CompleteProfileScreen() {
  const { refreshProfileStatus, signOut } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Prefilled from the auth user; locked when the provider already verified it.
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [phonePrefilled, setPhonePrefilled] = useState(''); // full phone if from phone-OTP auth
  const phoneLocked = phonePrefilled.length > 0;

  // Step 2 — trade
  const [tradeType, setTradeType] = useState<TradeType | ''>('');
  const [accountType, setAccountType] = useState<AccountType | ''>('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [vatNumber, setVatNumber] = useState('');

  // Step 3 — KYC
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseProofUri, setLicenseProofUri] = useState<string | null>(null);
  const [nationalIdUri, setNationalIdUri] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUri, setCompanyLogoUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (u) {
        const meta = (u.user_metadata ?? {}) as Record<string, string>;
        setFullName(meta.full_name ?? meta.name ?? '');
        if (u.email) {
          setEmail(u.email);
          setEmailLocked(true);
        }
        if (u.phone) {
          setPhonePrefilled(u.phone.startsWith('+') ? u.phone : `+${u.phone}`);
        }
      }
      setLoading(false);
    })();
  }, []);

  const fullPhone = phoneLocked ? phonePrefilled : `${countryCode}${phoneLocal}`;

  const valid =
    fullName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    fullPhone.replace(/\D/g, '').length >= 7 &&
    tradeType !== '' &&
    accountType !== '' &&
    parseFloat(hourlyRate) > 0 &&
    vatNumber.trim().length > 0 &&
    licenseNumber.trim().length > 0 &&
    !!licenseProofUri &&
    !!nationalIdUri;

  const snapshot = useMemo<SignUpInput>(
    () => ({
      fullName,
      email,
      password: '', // not used by createUserProfile — the session already exists
      phone: fullPhone,
      tradeType: tradeType as TradeType,
      accountType: accountType as AccountType,
      hourlyRate: parseFloat(hourlyRate || '0'),
      vatNumber,
      licenseNumber,
      licenseProofUri: licenseProofUri ?? '',
      nationalIdUri: nationalIdUri ?? '',
      companyName: companyName || undefined,
      companyLogoUri: companyLogoUri ?? undefined,
    }),
    [
      fullName, email, fullPhone, tradeType, accountType, hourlyRate, vatNumber,
      licenseNumber, licenseProofUri, nationalIdUri, companyName, companyLogoUri,
    ],
  );

  async function onConfirm() {
    setShowTerms(false);
    setSubmitting(true);
    try {
      await createUserProfile(snapshot);
      // users row now exists → flip the RootLayout gate into the app.
      await refreshProfileStatus();
    } catch (e: any) {
      Alert.alert('Could not finish sign-up', e?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <View className="flex-1 bg-white" />;

  const hasVerifiedChannels = emailLocked || phoneLocked;

  return (
    <KeyboardAwareScreen bottomInset={96}>
      <Text className="text-2xl font-bold text-gray-900 mb-1">Finish setting up</Text>
      <Text className="text-sm text-gray-500 mb-3">
        A few more details before you can start using TradesBrain.
      </Text>

      {hasVerifiedChannels && (
        <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <Text className="text-green-800 text-sm font-semibold mb-1">
            ✓ Your account is already verified
          </Text>
          <Text className="text-green-700 text-xs">
            {emailLocked && phoneLocked
              ? 'Email and phone are both verified — no more codes needed. Fill in your trade details below to finish.'
              : emailLocked
              ? 'Email is already verified. Fill in your trade details to finish setting up.'
              : 'Phone is already verified. Fill in your trade details to finish setting up.'}
          </Text>
        </View>
      )}

      <Field
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />
      <Field
        label={emailLocked ? 'Email address (verified)' : 'Email address'}
        value={email}
        onChangeText={setEmail}
        editable={!emailLocked}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">
        Phone number{phoneLocked ? ' (verified)' : ''}
      </Text>
      {phoneLocked ? (
        <View className="border border-gray-300 rounded-lg px-3 py-3 mb-4 bg-gray-100">
          <Text className="text-base text-gray-500">{phonePrefilled}</Text>
        </View>
      ) : (
        <View className="flex-row gap-2 mb-4">
          <TextInput
            value={countryCode}
            onChangeText={setCountryCode}
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-300 rounded-lg px-3 py-3 w-20 text-base text-gray-900"
          />
          <TextInput
            value={phoneLocal}
            onChangeText={setPhoneLocal}
            keyboardType="phone-pad"
            placeholder="555 123 4567"
            placeholderTextColor="#9CA3AF"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900"
          />
        </View>
      )}

      <Text className="text-sm font-medium text-gray-700 mb-2">Trade type</Text>
      <View className="mb-4">
        {TRADES.map((t) => (
          <RadioRow
            key={t.value}
            label={t.label}
            selected={tradeType === t.value}
            onPress={() => setTradeType(t.value)}
          />
        ))}
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-2">Account type</Text>
      <View className="mb-4">
        {ACCOUNT_TYPES.map((t) => (
          <RadioRow
            key={t.value}
            label={t.label}
            selected={accountType === t.value}
            onPress={() => setAccountType(t.value)}
          />
        ))}
      </View>

      <Field
        label="Hourly rate (USD)"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />
      <Field
        label="VAT number (locked after account creation)"
        value={vatNumber}
        onChangeText={setVatNumber}
        autoCapitalize="characters"
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">License proof (required)</Text>
      <PhotoPicker uri={licenseProofUri} onPick={() => pickImage(setLicenseProofUri)} />
      <Field
        label="License number"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
        autoCapitalize="characters"
      />

      <Text className="text-sm font-medium text-gray-700 mb-1 mt-2">National ID (required)</Text>
      <PhotoPicker uri={nationalIdUri} onPick={() => pickImage(setNationalIdUri)} />

      <Text className="text-sm font-medium text-gray-700 mb-1 mt-2">
        Company name (optional)
      </Text>
      <TextInput
        value={companyName}
        onChangeText={setCompanyName}
        placeholderTextColor="#9CA3AF"
        className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">Company logo (optional)</Text>
      <PhotoPicker uri={companyLogoUri} onPick={() => pickImage(setCompanyLogoUri)} />

      <Pressable
        disabled={!valid || submitting}
        onPress={() => setShowTerms(true)}
        className={`py-4 rounded-xl mt-2 ${valid && !submitting ? 'bg-brand' : 'bg-gray-300'}`}
      >
        <Text className="text-center text-white font-semibold">
          {submitting ? 'Finishing…' : 'Finish & continue'}
        </Text>
      </Pressable>

      <Pressable onPress={signOut} disabled={submitting} className="py-4 rounded-xl mt-2">
        <Text className="text-center text-gray-500 font-medium">
          Sign out — use a different email/phone
        </Text>
      </Pressable>

      <Pressable
        disabled={submitting}
        onPress={() => {
          Alert.alert(
            'Permanently delete this account?',
            'This wipes the auth record, photos, and any partial data for this email/phone — you can re-use the same details to sign up fresh.',
            [
              { text: 'Cancel' },
              {
                text: 'Delete forever',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteAccountFully();
                    Alert.alert('Account deleted', 'You can now sign up with the same details.');
                  } catch (e: any) {
                    Alert.alert('Could not delete', e?.message ?? 'Try again later.');
                  }
                },
              },
            ],
          );
        }}
        className="py-2 mt-1"
      >
        <Text className="text-center text-xs text-red-600 underline">
          Permanently delete this account
        </Text>
      </Pressable>

      <TermsOverlay
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={onConfirm}
      />
    </KeyboardAwareScreen>
  );
}
