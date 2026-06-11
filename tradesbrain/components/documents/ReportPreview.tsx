// D3 F2 — Report preview: inline-editable sections + VAT/license toggles +
// confirmed amount input. Used in the report builder screen.

import React from 'react';
import { View, Text, TextInput, Pressable, Switch } from 'react-native';
import type { ReportSection } from '../../services/documents';

interface Props {
  sections: ReportSection[];
  confirmedAmount: number | null;
  includesVat: boolean;
  includesLicense: boolean;
  // ISS-M12 (RQ-4): a suggested min–max range rather than a single figure.
  suggestedRange?: { min: number; max: number } | null;
  onSectionContentChange: (id: string, content: string) => void;
  onAddCustomSection: () => void;
  onRemoveSection: (id: string) => void;
  // ISS-15: reorder a section up or down in the report.
  onMoveSection: (id: string, dir: 'up' | 'down') => void;
  onConfirmedAmountChange: (n: number | null) => void;
  onIncludesVatChange: (v: boolean) => void;
  onIncludesLicenseChange: (v: boolean) => void;
}

export default function ReportPreview(props: Props) {
  const lastIndex = props.sections.length - 1;
  return (
    <View>
      {props.sections.map((s, idx) => (
        <View key={s.id} className="mb-4">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center flex-1">
              {/* D6 Flow05 S3 — visual drag handle next to each section title.
                  Behaviour is driven by the ↑↓ buttons on the right. */}
              <Text className="text-gray-300 text-base mr-1" accessibilityLabel="reorder handle">
                ⠿
              </Text>
              <Text className="text-sm font-semibold text-brand">
                {s.name}{s.custom ? ' · custom' : ''}
              </Text>
              <Text className="text-xs text-gray-400 ml-2">· Edit</Text>
            </View>
            {/* ISS-15: move-up / move-down controls (drag-free reorder). */}
            <View className="flex-row items-center">
              <Pressable
                onPress={() => props.onMoveSection(s.id, 'up')}
                disabled={idx === 0}
                hitSlop={6}
                className="px-2"
                accessibilityLabel={`Move ${s.name} up`}
              >
                <Text className={`text-base ${idx === 0 ? 'text-gray-300' : 'text-brand'}`}>↑</Text>
              </Pressable>
              <Pressable
                onPress={() => props.onMoveSection(s.id, 'down')}
                disabled={idx === lastIndex}
                hitSlop={6}
                className="px-2"
                accessibilityLabel={`Move ${s.name} down`}
              >
                <Text className={`text-base ${idx === lastIndex ? 'text-gray-300' : 'text-brand'}`}>↓</Text>
              </Pressable>
              {s.custom && (
                <Pressable onPress={() => props.onRemoveSection(s.id)} className="ml-2">
                  <Text className="text-red-600 text-xs">Remove</Text>
                </Pressable>
              )}
            </View>
          </View>
          <TextInput
            value={s.content}
            onChangeText={(t) => props.onSectionContentChange(s.id, t)}
            multiline
            placeholder={`Edit ${s.name.toLowerCase()}…`}
            placeholderTextColor="#9CA3AF"
            className="border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 min-h-[80px]"
          />
        </View>
      ))}

      <Pressable
        onPress={props.onAddCustomSection}
        className="py-3 rounded-lg border border-dashed border-gray-300 mb-4"
      >
        <Text className="text-center text-gray-600">+ Add custom section</Text>
      </Pressable>

      <Text className="text-sm font-semibold text-gray-700 mb-1">Confirmed amount</Text>
      {props.suggestedRange != null && (
        <Text className="text-xs text-gray-500 mb-1">
          Rex suggests a range of ${props.suggestedRange.min.toFixed(2)} – $
          {props.suggestedRange.max.toFixed(2)}
        </Text>
      )}
      <TextInput
        value={props.confirmedAmount?.toString() ?? ''}
        onChangeText={(t) =>
          props.onConfirmedAmountChange(t.length === 0 ? null : Number(t) || 0)
        }
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor="#9CA3AF"
        className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
      />

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-gray-700">Include VAT number</Text>
        <Switch value={props.includesVat} onValueChange={props.onIncludesVatChange} />
      </View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-gray-700">Include license number</Text>
        <Switch value={props.includesLicense} onValueChange={props.onIncludesLicenseChange} />
      </View>
    </View>
  );
}
