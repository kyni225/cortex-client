import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

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

const COULEURS: Record<EligibiliteStatut, { trait: string; fond: string; label: string }> = {
  eligible: { trait: '#0A6E31', fond: 'rgba(10,110,49,0.25)', label: 'Éligible' },
  zone_a_etudier: { trait: '#946200', fond: 'rgba(148,98,0,0.22)', label: 'À l\'étude' },
  non_eligible: { trait: '#8F8F8F', fond: 'rgba(120,120,120,0.20)', label: 'Non couvert' },
};

// Région par défaut : Abidjan (si la position du client n'est pas connue).
const ABIDJAN = { latitude: 5.345, longitude: -4.0, latitudeDelta: 0.14, longitudeDelta: 0.14 };

// Version native (iOS/Android). Le web charge EligibiliteMap.web.tsx.
export function EligibiliteMap({ coords, loading, height, zones = [] }: EligibiliteMapProps) {
  if (loading) {
    return (
      <View style={[styles.loading, { height }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const region = coords
    ? { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.09, longitudeDelta: 0.09 }
    : ABIDJAN;

  return (
    <View style={{ height }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation={!!coords}
        showsMyLocationButton={false}
      >
        {zones.map((z) => {
          const c = COULEURS[z.statut];
          return (
            <Polygon
              key={z.id}
              coordinates={z.contour}
              strokeColor={c.trait}
              fillColor={c.fond}
              strokeWidth={1.5}
            />
          );
        })}

        {coords && (
          <Marker coordinate={coords}>
            <View style={styles.pinWrap}>
              <Ionicons name="location" size={22} color={colors.white} />
            </View>
          </Marker>
        )}
      </MapView>

      {zones.length > 0 && (
        <View style={styles.legende}>
          {(['eligible', 'zone_a_etudier', 'non_eligible'] as EligibiliteStatut[]).map((s) => (
            <View key={s} style={styles.legendeRow}>
              <View style={[styles.legendePuce, { backgroundColor: COULEURS[s].trait }]} />
              <Text style={styles.legendeText}>{COULEURS[s].label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.infoSoft },
  pinWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  legende: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  legendeRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 1 },
  legendePuce: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
  legendeText: { fontSize: 11, color: colors.ink, fontWeight: '600' },
});
