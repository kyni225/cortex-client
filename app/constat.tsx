import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

// Données simulées — remontées par le prototype IoT branché sur la box.
// À remplacer par la vraie télémétrie (module iot-simulator du monorepo).
const MESURES: { label: string; valeur: string; etat: 'ok' | 'alerte' }[] = [
  { label: 'Signal fibre', valeur: 'Stable · -18 dBm', etat: 'ok' },
  { label: 'Débit descendant', valeur: '480 Mb/s', etat: 'ok' },
  { label: 'Débit montant', valeur: '92 Mb/s', etat: 'ok' },
  { label: 'Connexion WAN', valeur: 'Active', etat: 'ok' },
  { label: 'Stabilité (24 h)', valeur: '3 micro-coupures', etat: 'alerte' },
];

const ANOMALIE = {
  titre: 'Micro-coupures détectées',
  detail: 'Entre 21 h 04 et 21 h 12, la box a perdu la synchronisation 3 fois.',
  alerte: 'Un SMS a été envoyé automatiquement au 27 225 792 91.',
};

export default function ConstatScreen() {
  const router = useRouter();
  const envoyerMessageCortex = useAppStore((s) => s.envoyerMessageCortex);

  function discuterDuConstat() {
    envoyerMessageCortex(
      `J'ai une question sur le constat de ma box : "${ANOMALIE.titre}". ${ANOMALIE.detail}`
    );
    router.push('/cortex');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Constat de la box" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.liveCard}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Prototype connecté · dernière vérification il y a 3 min</Text>
          </View>
          <Text style={[typography.caption as any, { marginTop: spacing.xs }]}>
            Un capteur branché sur votre box analyse la connexion en continu et vous prévient en cas d'anomalie.
          </Text>
        </Card>

        <Text style={[typography.bodyBold as any, styles.section]}>Mesures</Text>
        <Card>
          {MESURES.map((m, i) => (
            <View key={m.label} style={[styles.mesure, i < MESURES.length - 1 && styles.mesureBorder]}>
              <Ionicons
                name={m.etat === 'ok' ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={m.etat === 'ok' ? colors.success : colors.warning}
              />
              <Text style={styles.mesureLabel}>{m.label}</Text>
              <Text style={styles.mesureValeur}>{m.valeur}</Text>
            </View>
          ))}
        </Card>

        <Text style={[typography.bodyBold as any, styles.section]}>Anomalie détectée</Text>
        <Card style={styles.anomalieCard}>
          <View style={styles.anomalieHead}>
            <Ionicons name="pulse" size={18} color={colors.warning} />
            <Text style={styles.anomalieTitre}>{ANOMALIE.titre}</Text>
            <Badge label="À surveiller" tone="warning" />
          </View>
          <Text style={[typography.body as any, { marginTop: spacing.sm }]}>{ANOMALIE.detail}</Text>
          <View style={styles.alerteRow}>
            <Ionicons name="mail" size={14} color={colors.primaryDark} />
            <Text style={styles.alerteText}>{ANOMALIE.alerte}</Text>
          </View>
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          <Button
            label="Signaler cette anomalie"
            icon="arrow-forward"
            iconPosition="right"
            onPress={() =>
              router.push({ pathname: '/reclamation', params: { categorie: 'connexion_ne_fonctionne_pas' } })
            }
          />
          <View style={{ marginTop: spacing.sm }}>
            <Button
              label="Discuter de ce constat avec Cortex"
              icon="chatbubble-ellipses-outline"
              variant="ghost"
              onPress={discuterDuConstat}
            />
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  liveCard: { backgroundColor: colors.black, borderColor: colors.black },
  liveRow: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.success, marginRight: spacing.sm },
  liveText: { color: colors.white, fontSize: 12.5, fontWeight: '700' },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
  mesure: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2 },
  mesureBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  mesureLabel: { flex: 1, marginLeft: spacing.sm, fontSize: 14, color: colors.ink },
  mesureValeur: { fontSize: 13, fontWeight: '700', color: colors.slate },
  anomalieCard: { borderColor: colors.warningSoft, backgroundColor: '#FFFDF2' },
  anomalieHead: { flexDirection: 'row', alignItems: 'center' },
  anomalieTitre: { flex: 1, marginLeft: spacing.sm, fontWeight: '700', fontSize: 15, color: colors.ink },
  alerteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  alerteText: { marginLeft: spacing.xs, fontSize: 12.5, fontWeight: '600', color: colors.primaryDark, flex: 1 },
});
