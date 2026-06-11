// D3 F5 / D6 Flow08 — History tab.
// Reverse-chronological list of confirmed-closed sessions, grouped under date
// dividers (TODAY / YESTERDAY / dated). Filter chips narrow by status or
// recency. Inline rename. Skeleton loading. Empty state with "Start first job".
// Accessible even when subscription is expired (RULE 6).

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, SectionList, RefreshControl, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';

import { useAuthContext } from '../../context/AuthContext';
import {
  fetchHistorySessions,
  updateJobName,
  type HistoryJob,
} from '../../services/history';
import JobCard from '../../components/history/JobCard';
import SkeletonCard from '../../components/history/SkeletonCard';
import EmptyState from '../../components/history/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// D6 Flow08 Screen 1 — narrowing filter chips above the list.
type FilterKey = 'all' | 'done' | 'open' | 'month';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'done', label: 'Done' },
  { key: 'open', label: 'Open' },
  { key: 'month', label: 'This month' },
];

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

// Pretty date header: "TODAY", "YESTERDAY", else "12 MAY 2026".
function bucketLabel(ts: string): string {
  const day = startOfDay(new Date(ts));
  const today = startOfDay(new Date());
  const yesterday = today - 86_400_000;
  if (day === today) return 'TODAY';
  if (day === yesterday) return 'YESTERDAY';
  return new Date(day)
    .toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export default function HistoryScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const [jobs, setJobs] = useState<HistoryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const reload = useCallback(async () => {
    if (!user) return;
    const rows = await fetchHistorySessions(user.id, search);
    setJobs(rows);
    setLoading(false);
  }, [user, search]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      reload();
    }, [reload]),
  );

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(reload, 250); // debounce search input
    return () => clearTimeout(t);
  }, [search, reload, user]);

  async function rename(jobId: string, name: string) {
    await updateJobName(jobId, name);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, jobName: name } : j)));
  }

  // Apply chip filter client-side over the already-loaded set.
  const filtered = useMemo(() => {
    const monthStart = startOfDay(new Date(new Date().setDate(1)));
    return jobs.filter((j) => {
      switch (filter) {
        case 'done':
          return j.status === 'completed';
        case 'open':
          return j.status === 'reopened';
        case 'month':
          return new Date(j.updatedAt).getTime() >= monthStart;
        default:
          return true;
      }
    });
  }, [jobs, filter]);

  // Group into date buckets preserving the reverse-chronological order of
  // services/history (which orders by updated_at desc).
  const groups = useMemo(() => {
    const out: { label: string; items: HistoryJob[] }[] = [];
    for (const j of filtered) {
      const label = bucketLabel(j.updatedAt);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(j);
      else out.push({ label, items: [j] });
    }
    return out;
  }, [filtered]);

  // SectionList sections from the date-bucket groups (virtualized — only the
  // visible JobCards mount, so a long history no longer renders all at once).
  const sections = groups.map((g) => ({ title: g.label, data: g.items }));

  // Search + filters live in a FIXED header above the list (not inside it), so
  // the search TextInput never loses focus on a list re-render and stays pinned
  // while the job list scrolls.
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Job History</Text>
        <Text className="text-sm text-gray-600 mb-4">
          Only confirmed-closed jobs appear here.
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by job name, address, or date"
          placeholderTextColor="#9CA3AF"
          className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-3"
        />

        {/* D6 Flow08 S1 — filter chips. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          className="mb-4"
        >
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                className={`px-3 py-1.5 rounded-full border ${
                  on ? 'border-brand bg-brand/10' : 'border-gray-300 bg-white'
                }`}
              >
                <Text className={`text-sm ${on ? 'text-brand font-semibold' : 'text-gray-700'}`}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="px-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : filtered.length === 0 ? (
        <View className="px-5">
          <EmptyState onStartFirstJob={() => nav.navigate('Job', { sessionId: 'new' })} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text className="text-xs font-semibold text-gray-500 tracking-wider mt-2 mb-2 bg-white">
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => nav.navigate('JobDetail', { jobId: item.id })}
              onRename={(name) => rename(item.id, name)}
              searchTerm={search}
            />
          )}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-10"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await reload();
                setRefreshing(false);
              }}
            />
          }
        />
      )}
    </View>
  );
}
