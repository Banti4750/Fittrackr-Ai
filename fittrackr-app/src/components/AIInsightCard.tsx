import React from 'react';
import { Text, View } from 'react-native';
import { AIInsight } from '../types';
import { useTheme } from '../theme/useTheme';
import { formatDateTime } from '../utils/format';

const iconMap = {
  weekly_summary: '📊',
  improvement_tip: '✨',
  plateau_alert: '⚠️',
  overtraining_warning: '🛑',
};

const labelMap = {
  weekly_summary: 'Weekly Summary',
  improvement_tip: 'Improvement Tip',
  plateau_alert: 'Plateau Alert',
  overtraining_warning: 'Overtraining Warning',
};

export function AIInsightCard({ insight }: { insight: AIInsight }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,92,0,0.25)',
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 20 }}>{iconMap[insight.type]}</Text>
        <Text
          style={{
            color: colors.accentOrange,
            fontWeight: '800',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          {labelMap[insight.type]}
        </Text>
      </View>
      <Text style={{ color: colors.text }}>{insight.content}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>
        {formatDateTime(insight.generatedAt)}
      </Text>
    </View>
  );
}
