import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '../../src/theme/useTheme';

function tabIcon(emoji: string) {
  return ({ focused, color }: { focused: boolean; color: string }) => (
    <Text style={{ fontSize: focused ? 24 : 20, color }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('🏠') }} />
      <Tabs.Screen name="log" options={{ title: 'Log', tabBarIcon: tabIcon('➕') }} />
      <Tabs.Screen name="exercises" options={{ title: 'Library', tabBarIcon: tabIcon('📚') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: tabIcon('📈') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('👤') }} />
    </Tabs>
  );
}
