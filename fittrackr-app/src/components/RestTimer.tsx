import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { scheduleLocalNotification } from '../utils/notifications';

interface Props {
  initialSeconds?: number;
  active: boolean;
  onComplete?: () => void;
}

export function RestTimer({ initialSeconds = 60, active, onComplete }: Props) {
  const { colors } = useTheme();
  const [seconds, setSeconds] = useState(initialSeconds);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setSeconds(initialSeconds);
      interval.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            if (interval.current) clearInterval(interval.current);
            scheduleLocalNotification('Rest complete', "Time for your next set 💪");
            onComplete?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [active, initialSeconds]);

  if (!active) return null;

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;

  return (
    <View
      style={{
        backgroundColor: colors.primaryMuted,
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>REST</Text>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>
          {mm}:{ss.toString().padStart(2, '0')}
        </Text>
      </View>
      <Pressable
        onPress={onComplete}
        style={{ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Skip</Text>
      </Pressable>
    </View>
  );
}
