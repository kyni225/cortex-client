import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StepperHorizontal } from '@/components/StepperHorizontal';
import { SuiviTechnicienMap } from '@/components/SuiviTechnicienMap';
import { TechnicienTrackingCard } from '@/components/TechnicienTrackingCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InfoBanner } from '@/components/ui/InfoBanner';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useTrajetTechnicien } from '@/hooks/useTrajetTechnicien';
import { useAppStore } from '@/store/useAppStore';

const CRENEAUX_DISPONIBLES: { date: string; creneau: string }[] = [
  { date: 'Demain', creneau: '08 h 00 – 12 h 00' },
  { date: 'Demain', creneau: '12 h 00 – 16 h 00' },
  { date: 'Après-demain', creneau: '08 h 00 – 12 h 00' },
];

export default function SuiviScreen() {
  const router = useRouter();
  const dossier = useAppStore((s) => s.dossier);
  const avancerEtapeSuivante = useAppStore((s) => s.avancerEtapeSuivante);
  const planifierRendezVous = useAppStore((s) => s.planifierRendezVous);
  const [historiqueOuvert, setHistoriqueOuvert] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { height: screenH } = useWindowDimensions();
  const mapH = Math.round(screenH * 0.4);

  const etapeEnCours = dossier?.etapes.find((e) => e.statut === 'en_cours');
  const technicienAssigneOuPlus =
    dossier?.etapes.find((e) => e.id === 'technicien_assigne')?.statut === 'fait';
  const estFibreActive = dossier?.statutGlobal === 'termine';
  const technicienEnRoute = etapeEnCours?.id === 'installation';
  // Étapes où le client doit agir lui-même : la simulation automatique s'y met en pause.
  const enAttenteAction =
    etapeEnCours?.id === 'rdv_a_planifier' || etapeEnCours?.id === 'confirmation_client';

  useEffect(() => {
    if (!simulationActive) return;
    simulationIntervalRef.current = setInterval(() => {
      avancerEtapeSuivante();
    }, 15000);
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [simulationActive, avancerEtapeSuivante]);

  useEffect(() => {
    if (simulationActive && estFibreActive) {
      setSimulationActive(false);
    }
  }, [simulationActive, estFibreActive]);

  const trajet = useTrajetTechnicien(dossier?.technicien?.itineraire, {
    actif: technicienEnRoute,
  });
  const clientCoords = dossier?.adresse.coords;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.h1 as any}>Suivi</Text>
        <Pressable onPress={() => router.push('/notifications')} hitSlop={10}>
          <Ionicons name="notifications-outline" size={22} color={colors.ink} />
        </Pressable>
      </View>

      {!dossier ? (
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={48} color={colors.muted} />
          <Text style={[typography.h3 as any, { marginTop: spacing.md, textAlign: 'center' }]}>
            Aucun dossier pour le moment
          </Text>
          <Text style={[typography.caption as any, { textAlign: 'center', marginTop: spacing.xs }]}>
            Vérifiez votre éligibilité pour démarrer une demande d'installation.
          </Text>
          <View style={{ marginTop: spacing.lg, width: '100%' }}>
            <Button label="Vérifier mon éligibilité" icon="wifi" onPress={() => router.push('/eligibilite')} />
          </View>
        </View>
      ) : estFibreActive ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.successWrap}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={34} color={colors.white} />
            </View>
            <Text style={[typography.h2 as any, styles.successTitle]}>Votre fibre est active</Text>
            <Text style={[typography.body as any, styles.successSubtitle]}>
              Merci, votre confirmation a bien été enregistrée. Vous pouvez désormais profiter pleinement de vos
              services.
            </Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.statutHeaderRow}>
              <View>
                <Text style={styles.labelSmall}>STATUT DU DOSSIER {dossier.numero}</Text>
                <Text style={typography.h3 as any}>Fibre active</Text>
              </View>
              <Badge label="actif" tone="info" />
            </View>
            {dossier.dateActivation && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={15} color={colors.muted} />
                <Text style={styles.metaText}>Date d'activation : {dossier.dateActivation}</Text>
              </View>
            )}
          </Card>

          <Pressable onPress={() => setHistoriqueOuvert((v) => !v)}>
            <View style={styles.historiqueLink}>
              <Text style={styles.historiqueLinkText}>Historique d'installation</Text>
              <Ionicons name={historiqueOuvert ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primaryDark} />
            </View>
          </Pressable>
          {historiqueOuvert && (
            <Card style={{ marginTop: spacing.sm }}>
              <StepperHorizontal etapes={dossier.etapes} />
            </Card>
          )}

          <View style={{ marginTop: spacing.xl }}>
            <Button
              label="Voir reçu"
              icon="receipt-outline"
              onPress={() => Alert.alert('Reçu', 'Votre reçu vous a été envoyé par SMS et email.')}
            />
            <View style={{ marginTop: spacing.sm }}>
              <Button label="Espace fibre" variant="ghost" onPress={() => router.push('/(tabs)')} />
            </View>
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      ) : technicienEnRoute && clientCoords && dossier.technicien?.itineraire && dossier.technicien ? (
        <View style={styles.trackingScreen}>
          <SuiviTechnicienMap
            clientPosition={clientCoords}
            technicienPosition={trajet.position}
            chemin={trajet.chemin}
            progression={trajet.progression}
            height={mapH}
            interactive
          />

          <View style={styles.trackSheet}>
            <View style={styles.trackGrip} />
            <ScrollView
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              <TechnicienTrackingCard
                technicien={dossier.technicien}
                etaMinutes={trajet.etaMinutes}
                arrive={trajet.arrive}
                onAppeler={() => router.push('/appel')}
                onDiscussion={() => router.push(`/chat/${dossier.technicien!.id}`)}
                onDetails={() => router.push(`/technicien/${dossier.technicien!.id}`)}
              />

              <View style={{ marginTop: spacing.lg }}>
                <InfoBanner
                  icon="alert-circle"
                  tone="warning"
                  text="Veuillez vous assurer d'être présent à l'adresse indiquée."
                />
              </View>

              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Suivi de l'installation</Text>
              <Card>
                <StepperHorizontal etapes={dossier.etapes} />
              </Card>

              {!simulationActive && (
                <View style={{ marginTop: spacing.md }}>
                  <Button label="Lancer la simulation" icon="play" onPress={() => setSimulationActive(true)} />
                </View>
              )}

              <View style={{ marginTop: spacing.lg }}>
                <Button
                  label="Signaler un problème"
                  variant="ghost"
                  icon="alert-circle-outline"
                  onPress={() => router.push('/reclamation')}
                />
              </View>

              <View style={{ height: spacing.xxl }} />
            </ScrollView>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {dossier.rdv && !dossier.interventionAConfirmer && (
            <View style={styles.rdvBanner}>
              <Text style={styles.rdvBannerText}>RDV prévu le {dossier.rdv.date}</Text>
            </View>
          )}

          {dossier.interventionAConfirmer ? (
            <View style={{ marginBottom: spacing.lg }}>
              <Button
                label="Confirmer la fin de l'intervention"
                icon="checkmark-circle"
                onPress={() => router.push('/intervention-confirmation')}
              />
            </View>
          ) : (
            <Card style={styles.card}>
              <View style={styles.prochaineActionHeader}>
                <Ionicons name="calendar" size={16} color={colors.primaryDark} />
                <Text style={styles.prochaineActionLabel}>PROCHAINE ACTION</Text>
              </View>
              <Text style={[typography.body as any, { marginBottom: spacing.md }]}>
                {etapeEnCours?.description ??
                  (technicienAssigneOuPlus
                    ? 'Votre technicien va bientôt se mettre en route.'
                    : 'Orange va vous assigner un technicien très prochainement.')}
              </Text>
              <Button
                label="Contactez le technicien"
                icon={technicienAssigneOuPlus ? 'chatbubble-ellipses' : 'lock-closed'}
                iconPosition="right"
                disabled={!technicienAssigneOuPlus}
                onPress={() => dossier.technicien && router.push(`/chat/${dossier.technicien.id}`)}
              />
            </Card>
          )}

          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Suivi de l'installation</Text>
          <Card>
            <StepperHorizontal etapes={dossier.etapes} />
          </Card>

          {etapeEnCours?.id === 'rdv_a_planifier' && (
            <Card style={{ marginTop: spacing.md }}>
              <Text style={typography.bodyBold as any}>Choisissez votre créneau</Text>
              <Text style={[typography.caption as any, { marginTop: 2, marginBottom: spacing.sm }]}>
                Sélectionnez le rendez-vous qui vous convient pour l'installation.
              </Text>
              {CRENEAUX_DISPONIBLES.map((slot) => (
                <Pressable
                  key={`${slot.date}-${slot.creneau}`}
                  style={styles.creneauRow}
                  onPress={() => planifierRendezVous(slot)}
                >
                  <Ionicons name="calendar-outline" size={16} color={colors.primaryDark} />
                  <Text style={styles.creneauText}>
                    {slot.date} · {slot.creneau}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              ))}
            </Card>
          )}

          {enAttenteAction ? (
            <View style={{ marginTop: spacing.md }}>
              <Button
                label={
                  etapeEnCours?.id === 'rdv_a_planifier'
                    ? 'En attente de votre choix de rendez-vous'
                    : 'En attente de votre confirmation'
                }
                icon="calendar"
                variant="ghost"
                disabled
                onPress={() => {}}
              />
            </View>
          ) : (
            !simulationActive && (
              <View style={{ marginTop: spacing.md }}>
                <Button label="Lancer la simulation" icon="play" onPress={() => setSimulationActive(true)} />
              </View>
            )
          )}

          <View style={{ marginTop: spacing.xl }}>
            <Button
              label="Signaler un problème"
              variant="ghost"
              icon="alert-circle-outline"
              onPress={() => router.push('/reclamation')}
            />
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  scroll: { paddingHorizontal: spacing.lg },
  trackingScreen: { flex: 1, backgroundColor: colors.infoSoft },
  trackSheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  trackGrip: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  sheetContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  card: { marginBottom: spacing.lg },
  labelSmall: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  metaText: { marginLeft: spacing.xs, fontSize: 13, color: colors.slate },
  rdvBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  rdvBannerText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  creneauRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  creneauText: { flex: 1, marginLeft: spacing.sm, fontSize: 14, fontWeight: '600', color: colors.ink },
  prochaineActionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  prochaineActionLabel: { fontSize: 11, fontWeight: '700', color: colors.primaryDark, marginLeft: spacing.xs, letterSpacing: 0.5 },
  sectionTitle: { ...(typography.h3 as any), marginBottom: spacing.md },
  successWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: { textAlign: 'center' },
  successSubtitle: { textAlign: 'center', color: colors.slate, marginTop: spacing.sm },
  statutHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historiqueLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  historiqueLinkText: { fontWeight: '700', color: colors.ink, fontSize: 15 },
});
