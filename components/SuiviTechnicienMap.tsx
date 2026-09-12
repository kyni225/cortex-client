import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { colors } from '@/constants/theme';
import { Coords } from '@/data/types';

interface Props {
  clientPosition: Coords;
  technicienPosition: Coords | null;
  chemin: Coords[];
  progression: number;
  height?: number;
  /** Suit le technicien (recentre la carte sur sa position). Ignoré si `interactive`. */
  suivrePosition?: boolean;
  /** Laisse l'utilisateur déplacer / zoomer la carte au doigt. */
  interactive?: boolean;
}

function regionEntre(a: Coords, b: Coords) {
  const latitude = (a.latitude + b.latitude) / 2;
  const longitude = (a.longitude + b.longitude) / 2;
  const latitudeDelta = Math.max(Math.abs(a.latitude - b.latitude) * 1.8, 0.02);
  const longitudeDelta = Math.max(Math.abs(a.longitude - b.longitude) * 1.8, 0.02);
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

// Carte native (iOS/Android). Le web charge SuiviTechnicienMap.web.tsx.
export function SuiviTechnicienMap({
  clientPosition,
  technicienPosition,
  chemin,
  progression,
  height = 220,
  suivrePosition = false,
  interactive = false,
}: Props) {
  const depart = chemin[0] ?? technicienPosition ?? clientPosition;
  const initialRegion = useMemo(() => regionEntre(depart, clientPosition), [depart, clientPosition]);

  const region =
    !interactive && suivrePosition && technicienPosition
      ? {
          latitude: technicienPosition.latitude,
          longitude: technicienPosition.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }
      : undefined;

  const indexActuel = Math.round(progression * Math.max(chemin.length - 1, 0));
  const parcouru = chemin.slice(0, indexActuel + 1);
  const reste = chemin.slice(indexActuel);

  return (
    <View style={[styles.wrap, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        region={region}
        showsTraffic
        showsCompass={false}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        pointerEvents={interactive ? 'auto' : 'none'}
      >
        {reste.length >= 2 && (
          <Polyline coordinates={reste} strokeColor={colors.muted} strokeWidth={4} lineDashPattern={[2, 6]} />
        )}
        {parcouru.length >= 2 && (
          <Polyline coordinates={parcouru} strokeColor={colors.primary} strokeWidth={6} />
        )}

        <Marker coordinate={clientPosition} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.pin, styles.pinClient]}>
            <Ionicons name="home" size={16} color={colors.white} />
          </View>
        </Marker>

        {technicienPosition && (
          <Marker coordinate={technicienPosition} anchor={{ x: 0.5, y: 0.5 }} flat>
            <View style={[styles.pin, styles.pinTech]}>
              <Ionicons name="car-sport" size={16} color={colors.white} />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.infoSoft },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  pinClient: { backgroundColor: colors.info },
  pinTech: { backgroundColor: colors.primary },
});
