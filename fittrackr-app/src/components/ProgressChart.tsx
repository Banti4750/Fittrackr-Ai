import React from 'react';
import { View, Text } from 'react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../theme/useTheme';

interface Props {
  data: Array<{ label: string; value: number }>;
  type?: 'line' | 'bar';
  height?: number;
  title?: string;
}

export function ProgressChart({ data, type = 'line', height = 220, title }: Props) {
  const { colors } = useTheme();
  if (!data.length) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted }}>No data yet</Text>
      </View>
    );
  }
  const series = data.map((d) => ({ value: d.value, label: d.label, dataPointText: '' }));
  const Chart = type === 'bar' ? BarChart : LineChart;
  return (
    <View>
      {title ? (
        <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 6 }}>{title}</Text>
      ) : null}
      <Chart
        data={series as any}
        height={height}
        color={colors.chartLine}
        thickness={2}
        spacing={Math.max(28, Math.floor(280 / Math.max(1, data.length)))}
        yAxisColor={colors.border}
        xAxisColor={colors.border}
        rulesColor={colors.border}
        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        noOfSections={4}
        hideDataPoints={false}
        dataPointsColor={colors.chartLine}
        frontColor={colors.chartLine}
      />
    </View>
  );
}
