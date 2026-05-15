import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '../src/components/Screen';
import { Button } from '../src/components/Button';
import { AIInsightCard } from '../src/components/AIInsightCard';
import { useTheme } from '../src/theme/useTheme';
import { generateInsights, latestInsights } from '../src/api/ai';
import { formatDateTime } from '../src/utils/format';

export default function Insights() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['insights', 'latest'], queryFn: latestInsights });
  const gen = useMutation({
    mutationFn: generateInsights,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insights', 'latest'] }),
  });

  const latest = list.data?.[0];
  const payload = latest?.payload;

  return (
    <Screen>
      {gen.isPending ? (
        <View style={{ alignItems: 'center', padding: 24, gap: 8 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted }}>Analyzing your training data…</Text>
        </View>
      ) : null}

      {latest ? (
        <>
          <AIInsightCard insight={latest} />
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Generated {formatDateTime(latest.generatedAt)}
          </Text>
        </>
      ) : (
        <Text style={{ color: colors.textMuted }}>No insights yet — tap Regenerate.</Text>
      )}

      {payload ? (
        <>
          <Section title="Weekly insight">
            <Text style={{ color: colors.text }}>{payload.weeklyInsight}</Text>
          </Section>

          <Section title="Improvements">
            {payload.improvements?.map((s, i) => (
              <Text key={i} style={{ color: colors.success }}>
                ✓ {s}
              </Text>
            ))}
          </Section>

          <Section title="Concerns">
            {payload.concerns?.map((s, i) => (
              <Text key={i} style={{ color: colors.warn }}>
                ⚠ {s}
              </Text>
            ))}
          </Section>

          <Section title="Suggested next workout">
            {payload.suggestedNextWorkout?.exercises?.map((x, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 4,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text }}>{x.name}</Text>
                <Text style={{ color: colors.textMuted }}>
                  {x.sets} × {x.reps}
                  {x.weight ? ` @ ${x.weight}kg` : ''}
                </Text>
              </View>
            ))}
          </Section>

          <Section title="Coach's message">
            <Text style={{ color: colors.text, fontStyle: 'italic' }}>"{payload.motivationalMessage}"</Text>
          </Section>
        </>
      ) : null}

      <Button
        title={gen.isPending ? 'Generating…' : 'Regenerate insights'}
        onPress={() => gen.mutate()}
        loading={gen.isPending}
      />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 6,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: '700' }}>{title}</Text>
      {children}
    </View>
  );
}
