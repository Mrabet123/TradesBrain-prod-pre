// D3 F4 — Tappable code citation. Shows the document/section as a pill;
// expands inline on press to reveal the full code chunk text with metadata header.

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { CodeCitation } from '../../services/codeLookup';

interface Props {
  citation: CodeCitation;
}

export default function CitationCard({ citation }: Props) {
  const [expanded, setExpanded] = useState(false);
  const label = `${citation.documentName} ${citation.version}${
    citation.sectionNumber ? ' § ' + citation.sectionNumber : ''
  }`;

  return (
    <View className="mb-2">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="bg-brand/10 border border-brand/30 rounded-lg px-3 py-2 flex-row items-center justify-between"
      >
        <Text className="text-brand text-sm font-medium flex-1 mr-2">{label}</Text>
        <Text className="text-brand text-xs">{expanded ? 'Hide' : 'View'}</Text>
      </Pressable>
      {expanded && (
        <View className="border border-brand/30 border-t-0 rounded-b-lg bg-blue-50 -mt-1 overflow-hidden">
          {/* Metadata header — document name, version, section */}
          <View className="bg-brand/10 px-3 py-2 border-b border-brand/20">
            <Text className="text-[11px] font-semibold text-brand uppercase tracking-wide">
              {citation.documentName}
            </Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <Text className="text-[11px] text-brand/70">{citation.version}</Text>
              {citation.sectionNumber ? (
                <Text className="text-[11px] text-brand/70">
                  {'§ ' + citation.sectionNumber}
                </Text>
              ) : null}
              <Text className="text-[10px] text-brand/50 ml-auto">
                {(citation.similarity * 100).toFixed(1)}% match
              </Text>
            </View>
          </View>
          {/* Full content body */}
          <View className="px-3 py-3">
            <Text className="text-xs text-gray-800 leading-5">{citation.content}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
