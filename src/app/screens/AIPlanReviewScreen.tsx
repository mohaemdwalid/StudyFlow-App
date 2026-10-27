import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper, PrimaryButton, GhostButton, Card, SubjectChip, StatusPill } from '../components';

export default function AIPlanReviewScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { planBlocks, subjects } = useAppStore();

  const [blocks, setBlocks] = useState(
    planBlocks.map((b) => ({ ...b })).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const toggleLock = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, locked: !b.locked } : b)),
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const totalMinutes = blocks.reduce((acc, b) => acc + b.duration, 0);

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, flex: 1, marginLeft: 12 }]}>
          Your AI Plan
        </Text>
        <TouchableOpacity style={[styles.regenerateChip, { borderColor: theme.accent.violet }]}>
          <MaterialIcons name="refresh" size={16} color={theme.accent.violet} />
          <Text style={[theme.typography.label, { color: theme.accent.violet, marginLeft: 4 }]}>
            Regenerate
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      <View style={[styles.summaryBar, { backgroundColor: theme.colors.elevated }]}>
        <View style={styles.summaryItem}>
          <Text style={[theme.typography.h3, { color: theme.accent.violet }]}>{blocks.length}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>blocks</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.divider }]} />
        <View style={styles.summaryItem}>
          <Text style={[theme.typography.h3, { color: theme.accent.violet }]}>{formatDuration(totalMinutes)}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>total</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.divider }]} />
        <View style={styles.summaryItem}>
          <Text style={[theme.typography.h3, { color: theme.accent.violet }]}>
            {blocks.filter((b) => b.locked).length}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>locked</Text>
        </View>
      </View>

      {/* Plan Blocks */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {blocks.map((block, index) => {
          const subject = getSubject(block.subjectId);
          const subjectColor = subject?.color ?? theme.accent.violet;

          return (
            <Card
              key={block.id}
              style={[
                styles.blockCard,
                { borderLeftWidth: 3, borderLeftColor: subjectColor },
                block.locked ? { opacity: 0.85 } : undefined,
              ]}
            >
              <View style={styles.blockTop}>
                {/* Time Badge */}
                <View style={[styles.timeBadge, { backgroundColor: theme.colors.elevated }]}>
                  <MaterialIcons name="schedule" size={12} color={theme.colors.textSecondary} />
                  <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginLeft: 4 }]}>
                    {block.startTime}
                  </Text>
                </View>

                {/* Subject Chip */}
                {subject && (
                  <SubjectChip
                    name={subject.name}
                    color={subject.color}
                    small
                    style={{ flexShrink: 0 }}
                  />
                )}
              </View>

              {/* Block Content */}
              <View style={styles.blockContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {block.label}
                  </Text>
                  <View style={styles.blockMeta}>
                    <StatusPill
                      label={formatDuration(block.duration)}
                      variant="neutral"
                      style={{ flexShrink: 0 }}
                    />
                    <StatusPill
                      label={block.type}
                      variant="info"
                      style={{ marginLeft: 6, flexShrink: 0 }}
                    />
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.blockActions}>
                  <TouchableOpacity
                    onPress={() => toggleLock(block.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons
                      name={block.locked ? 'lock' : 'lock-open'}
                      size={18}
                      color={block.locked ? theme.accent.amber : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteBlock(block.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="close" size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <MaterialIcons name="drag-handle" size={18} color={theme.colors.divider} />
                </View>
              </View>
            </Card>
          );
        })}

        {blocks.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-note" size={48} color={theme.colors.divider} />
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              All blocks removed. Tap Regenerate to create a new plan.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyFooter, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.divider }]}>
        <PrimaryButton
          title="Apply Plan ✓"
          onPress={() => navigation.goBack()}
          disabled={blocks.length === 0}
          icon="check"
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  regenerateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    flexShrink: 0,
  },
  summaryBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  blockCard: {
    marginBottom: 10,
  },
  blockTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  blockContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockMeta: {
    flexDirection: 'row',
    marginTop: 6,
  },
  blockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  stickyFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
