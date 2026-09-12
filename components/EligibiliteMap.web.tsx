import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { EligibiliteStatut, ZoneCouverture } from '@/data/types';

interface Coords {
  latitude: number;
  longitude: number;
}

interface EligibiliteMapProps {
  coords: Coords | null;
  loading: boolean;
  height: number;
  zones?: ZoneCouverture[];
}

const COULEURS: Record<EligibiliteStatut, string> = {
  eligible: '#0A6E31',
  zone_a_etudier: '#946200',
  non_eligible: '#8F8F8F',
};

const LABELS: Record<EligibiliteStatut, string> = {
  eligible: 'Éligible',
  zone_a_etudier: "À l'étude",
  non_eligible: 'Non couvert',
};

// Repli web — react-native-maps non supporté. On liste les zones à plat.
export function EligibiliteMap({ loading, height, zones = [] }: EligibiliteMapProps) {
  return (
    <View style={[styles.wrap, { height }]}>
      {loading ? (
        <ActivityIndicator color={colors.info} />
      ) : (
        <>
          <Ionicons name="map" size={26} color={colors.info} />
          <View style={styles.zones}>
            {zones.map((z) => (
              <View key={z.id} style={styles.zoneChip}>
                <View style={[styles.puce, { backgroundColor: COULEURS[z.statut] }]} />
                <Text style={styles.zoneText}>
                  {z.nom} · {LABELS[z.statut]}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>Carte interactive disponible sur mobile</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  zones: { marginTop: spacing.sm, alignSelf: 'stretch' },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginVertical: 2,
  },
  puce: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
  zoneText: { fontSize: 11.5, color: colors.ink, fontWeight: '600' },
  note: { marginTop: spacing.sm, fontSize: 11, color: colors.slate, fontWeight: '600' },
});
