// D3 F3 — Quote preview: line items editor, labour, payment terms/methods,
// validity, notes, VAT/license toggles, confirmed total.

import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, Switch, Animated, PanResponder } from 'react-native';
import PaymentMethodSelector from './PaymentMethodSelector';
import type { QuoteDraft, QuoteLineItem } from '../../services/documents';
import { quoteSubtotal, quoteSuggestedRange } from '../../services/documents';

interface Props {
  draft: QuoteDraft;
  onChange: (next: QuoteDraft) => void;
}

// D3 F3 / D6 Flow06 S4 — swipe a line-item row left to reveal a Delete action.
// PanResponder only claims clearly-horizontal drags, so tapping the inline
// TextInputs and scrolling the list vertically both still work. The ✕ button
// remains as an explicit, accessible fallback.
function SwipeableLineItemRow({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const tx = useRef(new Animated.Value(0)).current;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 8,
      onPanResponderMove: (_e, g) => {
        if (g.dx < 0) tx.setValue(Math.max(g.dx, -96));
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -64) {
          Animated.timing(tx, { toValue: -96, duration: 120, useNativeDriver: true }).start();
        } else {
          Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;
  return (
    <View>
      <Pressable
        onPress={onDelete}
        className="absolute right-0 top-0 bottom-0 w-24 bg-red-600 items-center justify-center"
      >
        <Text className="text-white font-semibold text-sm">Delete</Text>
      </Pressable>
      <Animated.View
        style={{ transform: [{ translateX: tx }] }}
        className="bg-white"
        {...pan.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export default function QuotePreview({ draft, onChange }: Props) {
  function updateLine(id: string, patch: Partial<QuoteLineItem>) {
    onChange({
      ...draft,
      lineItems: draft.lineItems.map((li) => (li.id === id ? { ...li, ...patch } : li)),
    });
  }

  function addLine() {
    onChange({
      ...draft,
      lineItems: [
        ...draft.lineItems,
        { id: `li-${Date.now()}`, name: '', qty: 1, unitCost: 0 },
      ],
    });
  }

  function removeLine(id: string) {
    onChange({ ...draft, lineItems: draft.lineItems.filter((li) => li.id !== id) });
  }

  const subtotal = quoteSubtotal(draft);
  // ISS-8: suggested customer-facing total range (cost → +30% markup band).
  const suggestedRange = quoteSuggestedRange(draft);

  return (
    <View>
      <Text className="text-sm font-semibold text-brand mb-2">Line items</Text>
      <View className="border border-gray-200 rounded-lg overflow-hidden mb-2">
        <View className="flex-row bg-gray-50 px-2 py-2 border-b border-gray-200">
          <Text className="flex-1 text-xs font-semibold text-gray-700">Item</Text>
          <Text className="w-12 text-right text-xs font-semibold text-gray-700">Qty</Text>
          <Text className="w-20 text-right text-xs font-semibold text-gray-700">Unit $</Text>
          <Text className="w-20 text-right text-xs font-semibold text-gray-700">Total</Text>
          <View className="w-8" />
        </View>
        {draft.lineItems.length === 0 && (
          <Text className="px-3 py-3 text-gray-400 text-sm">No line items yet.</Text>
        )}
        {draft.lineItems.map((li) => {
          // ISS-22: flag items that need worker input — zero cost or empty name.
          const needsInput = li.unitCost === 0 || !li.name.trim();
          return (
          <SwipeableLineItemRow key={li.id} onDelete={() => removeLine(li.id)}>
          <View className="flex-row items-center px-2 py-2 border-b border-gray-100">
            <View className="flex-1 flex-row items-center">
            <TextInput
              value={li.name}
              onChangeText={(t) => updateLine(li.id, { name: t })}
              placeholder="Item name"
              className="flex-1 px-1 text-sm"
            />
            {needsInput && (
              <Text className="text-amber-500 text-sm font-bold ml-0.5" accessibilityLabel="needs input">
                {'*'}
              </Text>
            )}
            </View>
            <TextInput
              value={li.qty.toString()}
              onChangeText={(t) => updateLine(li.id, { qty: Number(t) || 0 })}
              keyboardType="decimal-pad"
              className="w-12 text-right text-sm"
            />
            <TextInput
              value={li.unitCost.toString()}
              onChangeText={(t) => updateLine(li.id, { unitCost: Number(t) || 0 })}
              keyboardType="decimal-pad"
              className="w-20 text-right text-sm"
            />
            <Text className="w-20 text-right text-sm font-medium">
              ${(li.qty * li.unitCost).toFixed(2)}
            </Text>
            <Pressable onPress={() => removeLine(li.id)} className="w-8 items-end pr-1">
              <Text className="text-red-600 text-base">✕</Text>
            </Pressable>
          </View>
          </SwipeableLineItemRow>
          );
        })}
      </View>
      <Pressable
        onPress={addLine}
        className="py-3 rounded-lg border border-dashed border-gray-300 mb-4"
      >
        <Text className="text-center text-gray-600">+ Add line item</Text>
      </Pressable>

      <Text className="text-sm font-semibold text-brand mb-2">Labour</Text>
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">Hours</Text>
          <TextInput
            value={draft.labourHours.toString()}
            onChangeText={(t) => onChange({ ...draft, labourHours: Number(t) || 0 })}
            keyboardType="decimal-pad"
            className="border border-gray-300 rounded-lg px-3 py-2 text-base"
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">Rate ($/h)</Text>
          <TextInput
            value={draft.hourlyRateSnapshot.toString()}
            onChangeText={(t) =>
              onChange({ ...draft, hourlyRateSnapshot: Number(t) || 0 })
            }
            keyboardType="decimal-pad"
            className="border border-gray-300 rounded-lg px-3 py-2 text-base"
          />
        </View>
      </View>

      <Text className="text-sm font-semibold text-brand mb-1">Payment terms</Text>
      <TextInput
        value={draft.paymentTerms}
        onChangeText={(t) => onChange({ ...draft, paymentTerms: t })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-base mb-3"
      />

      <Text className="text-sm font-semibold text-brand mb-2">Payment methods</Text>
      <View className="mb-3">
        <PaymentMethodSelector
          selected={draft.paymentMethods}
          onChange={(methods) => onChange({ ...draft, paymentMethods: methods })}
        />
      </View>

      <Text className="text-sm font-semibold text-brand mb-1">Validity (days)</Text>
      <TextInput
        value={draft.validityDays.toString()}
        onChangeText={(t) => onChange({ ...draft, validityDays: Number(t) || 0 })}
        keyboardType="number-pad"
        className="border border-gray-300 rounded-lg px-3 py-2 text-base mb-3"
      />

      <Text className="text-sm font-semibold text-brand mb-1">Notes</Text>
      <TextInput
        value={draft.notes}
        onChangeText={(t) => onChange({ ...draft, notes: t })}
        multiline
        className="border border-gray-300 rounded-lg px-3 py-2 text-base min-h-[60px] mb-3"
      />

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-gray-700">Include VAT number</Text>
        <Switch
          value={draft.includesVat}
          onValueChange={(v) => onChange({ ...draft, includesVat: v })}
        />
      </View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-gray-700">Include license number</Text>
        <Switch
          value={draft.includesLicense}
          onValueChange={(v) => onChange({ ...draft, includesLicense: v })}
        />
      </View>

      <View className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-1">
        <Text className="text-sm text-gray-600">Subtotal (auto)</Text>
        <Text className="text-2xl font-bold text-gray-900">${subtotal.toFixed(2)}</Text>
      </View>
      <Text className="text-xs text-gray-400 mb-3">
        Tip: a 15–30% markup on materials is typical.
      </Text>

      <Text className="text-sm font-semibold text-brand mb-1">Confirmed total</Text>
      {suggestedRange != null && draft.confirmedTotal == null && (
        <Text className="text-xs text-gray-500 mb-1">
          Rex suggests a range of ${suggestedRange.min.toFixed(2)} – $
          {suggestedRange.max.toFixed(2)}
        </Text>
      )}
      <TextInput
        value={draft.confirmedTotal?.toString() ?? ''}
        onChangeText={(t) =>
          onChange({
            ...draft,
            confirmedTotal: t.length === 0 ? null : Number(t) || 0,
          })
        }
        keyboardType="decimal-pad"
        placeholder={subtotal.toFixed(2)}
        className="border border-gray-300 rounded-lg px-3 py-3 text-base mb-2"
      />
      <Text className="text-xs text-gray-500 mb-4">
        Leave blank to use the subtotal above.
      </Text>
    </View>
  );
}
