import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            borderTopColor: colors.border,
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom + 6,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="accueil"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="suivi"
          options={{
            title: 'Suivi',
            tabBarIcon: ({ color, size }) => <Ionicons name="sync" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="signaler"
          options={{
            title: 'Signaler',
            tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
    </Tabs>
  );
}
