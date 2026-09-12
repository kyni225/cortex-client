import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { Coords } from '@/data/types';

interface Props {
  clientPosition: Coords;
  technicienPosition: Coords | null;
  chemin: Coords[];
  progression: number;
  height?: number;
}

// Repli web — react-native-maps n'est pas supporté. On montre une
// représentation schématique de la progression du technicien.
export function SuiviTechnicienMap({ progression, height = 220 }: Props) {
  return (
    <View style={[styles.wrap, { height }]}>
      <View style={styles.track}>
        <View style={styles.line} />
        <View style={[styles.lineDone, { width: `${Math.round(progression * 100)}%` }]} />
        <View style={[styles.dot, styles.dotStart]}>
          <Ionicons name="car-sport" size={14} color={colors.white} />
        </View>
        <View style={[styles.dot, styles.dotEnd]}>
          <Ionicons name="home" size={14} color={colors.white} />
        </View>
        <View style={[styles.mover, { left: `${Math.round(progression * 100)}%` }]}>
          <Ionicons name="navigate" size={13} color={colors.white} />
        </View>
      </View>
      <Text style={styles.caption}>Suivi cartographique disponible sur mobile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  track: { width: '100%', height: 40, justifyContent: 'center' },
  line: { position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, backgroundColor: colors.border },
  lineDone: { position: 'absolute', left: 0, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  dot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  dotStart: { left: 0, backgroundColor: colors.primary },
  dotEnd: { right: 0, backgroundColor: colors.info },
  mover: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: { marginTop: spacing.md, fontSize: 12, color: colors.slate, fontWeight: '600' },
});
