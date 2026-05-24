// D3 F5 — Job card in the History list. No customer name (RULE 5). Trade
// badge, status, counts, optional inline-editable job name. Matching search
// terms in the name / jobsite are highlighted in yellow per D6 Flow08 S2.

import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import type { HistoryJob } from '../../services/history';

interface Props {
  job: HistoryJob;
  onPress: () => void;
  onRename: (newName: string) => void | Promise<void>;
  /** Active search term — case-insensitive matches are highlighted in yellow. */
  searchTerm?: string;
}

// Splits `text` around case-insensitive matches of `term` and renders the
// matches with a yellow background. Returns a list of <Text> children.
function highlightMatches(
  text: string,
  term: string | undefined,
  className: string,
): React.ReactNode {
  if (!term) return <Text className={className}>{text}</Text>;
  const trimmed = term.trim();
  if (!trimmed) return <Text className={className}>{text}</Text>;
  // Escape regex special chars in the search term.
  const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${safe})`, 'ig'));
  return (
    <Text className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <Text key={i} className={`${className} bg-yellow-200`}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

export default function JobCard({ job, onPress, onRename, searchTerm }: Props) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(job.jobName ?? '');

  async function commit() {
    setEditing(false);
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== job.jobName) await onRename(trimmed);
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
    >
      <View className="flex-row items-start justify-between mb-1">
        {editing ? (
          <TextInput
            value={draftName}
            onChangeText={setDraftName}
            onBlur={commit}
            onSubmitEditing={commit}
            autoFocus
            className="flex-1 text-base font-semibold border-b border-brand pb-0.5"
          />
        ) : (
          <Pressable onPress={() => setEditing(true)} className="flex-1">
            <View className="flex-row items-center">
              {highlightMatches(
                job.jobName || 'Untitled job',
                searchTerm,
                'text-base font-semibold text-gray-900',
              )}
              <Text className="text-xs text-gray-400 ml-1">✎</Text>
            </View>
          </Pressable>
        )}
        <View className="bg-brand/10 rounded-full px-2 py-0.5 ml-2">
          <Text className="text-[11px] text-brand font-medium uppercase">
            {job.tradeType}
          </Text>
        </View>
      </View>

      {job.jobsite && (
        <View className="mb-1 flex-row items-center">
          <Text className="text-xs text-gray-500">📍 </Text>
          {highlightMatches(job.jobsite, searchTerm, 'text-xs text-gray-500')}
        </View>
      )}

      <Text className="text-xs text-gray-500">
        {new Date(job.updatedAt).toLocaleDateString()} ·{' '}
        {job.status === 'reopened' ? 'Reopened' : 'Completed'} · {job.messageCount} msgs ·{' '}
        {job.reportCount} report{job.reportCount === 1 ? '' : 's'} ·{' '}
        {job.quoteCount} quote{job.quoteCount === 1 ? '' : 's'}
      </Text>
    </Pressable>
  );
}
