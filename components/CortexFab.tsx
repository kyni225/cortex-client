import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { CortexRobotIcon } from '@/components/CortexRobotIcon';
import { shadow, spacing } from '@/constants/theme';

interface CortexFabProps {
  // Hauteur de la barre d'onglets sous le bouton, pour rester bien au-dessus
  // (varie selon la zone de sécurité de l'appareil).
  bottomOffset?: number;
}

// Bouton flottant vers l'assistant IA Cortex — affiché uniquement sur
// l'écran d'accueil (rendu par app/(tabs)/accueil.tsx).
export function CortexFab({ bottomOffset = 62 }: CortexFabProps) {
  const router = useRouter();

  return (
    <Pressable
      style={[styles.fab, { bottom: bottomOffset + spacing.md }]}
      onPress={() => router.push('/cortex')}
      accessibilityLabel="Assistant Cortex"
    >
      <CortexRobotIcon size={52} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
});
