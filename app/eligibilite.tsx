import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EligibiliteMap } from '@/components/EligibiliteMap';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { zonesCouverture } from '@/data/mockData';
import { Adresse } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

// Communes d'Abidjan avec un point représentatif — sert au test
// point-dans-polygone contre les zones de couverture.
const VILLES: { nom: string; coords: { latitude: number; longitude: number } }[] = [
  { nom: 'Cocody', coords: { latitude: 5.36, longitude: -3.994 } },
  { nom: 'Le Plateau', coords: { latitude: 5.326, longitude: -4.016 } },
  { nom: 'Marcory', coords: { latitude: 5.289, longitude: -3.997 } },
  { nom: 'Treichville', coords: { latitude: 5.297, longitude: -4.018 } },
  { nom: 'Yopougon', coords: { latitude: 5.336, longitude: -4.072 } },
  { nom: 'Abobo', coords: { latitude: 5.427, longitude: -4.022 } },
  { nom: 'Port-Bouët', coords: { latitude: 5.25, longitude: -3.939 } },
  { nom: 'Adjamé', coords: { latitude: 5.365, longitude: -4.022 } },
  { nom: 'Koumassi', coords: { latitude: 5.3, longitude: -3.96 } },
  { nom: 'Attécoubé', coords: { latitude: 5.34, longitude: -4.03 } },
];

const RESULTAT_CONFIG = {
  eligible: {
    icon: 'checkmark-circle' as const,
    color: colors.success,
    bg: colors.successSoft,
    titre: 'Bonne nouvelle !',
    soustitre: 'Votre adresse est éligible à la Fibre. Choisissez maintenant l\'offre qui correspond à vos besoins.',
  },
  zone_a_etudier: {
    icon: 'time' as const,
    color: colors.warning,
    bg: colors.warningSoft,
    titre: 'Votre zone est en cours de déploiement',
    soustitre: '',
  },
  non_eligible: {
    icon: 'close-circle' as const,
    color: colors.danger,
    bg: colors.dangerSoft,
    titre: 'Non éligible pour le moment',
    soustitre: '',
  },
};

export default function EligibiliteScreen() {
  const router = useRouter();
  const client = useAppStore((s) => s.client);
  const eligibiliteResult = useAppStore((s) => s.eligibiliteResult);
  const eligibiliteLoading = useAppStore((s) => s.eligibiliteLoading);
  const verifierEligibilite = useAppStore((s) => s.verifierEligibilite);
  const reinitialiserEligibilite = useAppStore((s) => s.reinitialiserEligibilite);

  const [adresse, setAdresse] = useState<Adresse>(client.adresse);
  const [modeManuel, setModeManuel] = useState(false);
  const [villeOuvert, setVilleOuvert] = useState(false);
  const [codeBox, setCodeBox] = useState('');

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [localisationEnCours, setLocalisationEnCours] = useState(true);
  const [localisationRefusee, setLocalisationRefusee] = useState(false);

  async function localiser(auto = false) {
    setLocalisationRefusee(false);
    setLocalisationEnCours(true);
    try {
      const servicesOk = await Location.hasServicesEnabledAsync();
      if (!servicesOk) {
        if (!auto) Alert.alert('Localisation désactivée', 'Activez la localisation de votre téléphone puis réessayez.');
        setLocalisationRefusee(true);
        setModeManuel(true);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!auto) Alert.alert('Autorisation refusée', 'Autorisez l\'accès à votre position dans les réglages pour utiliser la géolocalisation.');
        setLocalisationRefusee(true);
        setModeManuel(true);
        return;
      }

      // Position en cache (instantané) puis position fraîche avec un délai max.
      const cache = await Location.getLastKnownPositionAsync();
      let position = cache;
      try {
        position = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000)),
        ]) ?? cache;
      } catch {
        position = cache;
      }

      if (!position) {
        if (!auto) Alert.alert('Position introuvable', 'Impossible d\'obtenir votre position. Choisissez votre commune manuellement.');
        setLocalisationRefusee(true);
        setModeManuel(true);
        return;
      }

      const pos = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoords(pos);
      setLocalisationRefusee(false);

      try {
        const [lieu] = await Location.reverseGeocodeAsync(position.coords);
        setAdresse((a) => ({
          ...a,
          numero: lieu?.streetNumber ?? a.numero,
          rue: lieu?.street ?? a.rue,
          codePostal: lieu?.postalCode ?? a.codePostal,
          ville: lieu?.city ?? lieu?.region ?? a.ville,
          coords: pos,
        }));
      } catch {
        setAdresse((a) => ({ ...a, coords: pos }));
      }

      if (!auto) await verifierEligibilite({ ...adresse, coords: pos });
    } catch {
      if (!auto) Alert.alert('Erreur', 'La géolocalisation a échoué. Choisissez votre commune manuellement.');
      setLocalisationRefusee(true);
      setModeManuel(true);
    } finally {
      setLocalisationEnCours(false);
    }
  }

  function localiserMaintenant() {
    localiser(false);
  }

  useEffect(() => {
    localiser(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adresseTexte = `${adresse.numero} ${adresse.rue}, ${adresse.ville}`;
  const formValide = !!(adresse.numero.trim() && adresse.rue.trim() && adresse.ville.trim());

  async function onVerifier() {
    if (!formValide) return;
    await verifierEligibilite({ ...adresse, coords: coords ?? adresse.coords ?? client.adresse.coords });
  }

  function onContinuerAvecCode() {
    // Le client a déjà sa box → il se connecte, direction l'accueil.
    router.replace('/(tabs)/accueil');
  }

  function recommencer() {
    reinitialiserEligibilite();
    setCodeBox('');
  }

  function onDemanderInstallation() {
    if (!eligibiliteResult) return;
    router.push({
      pathname: '/choix-offre',
      params: { adresse: JSON.stringify(eligibiliteResult.adresse) },
    });
  }

  const config = eligibiliteResult ? RESULTAT_CONFIG[eligibiliteResult.statut] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Éligibilité fibre" showBack={!eligibiliteResult} onBack={() => router.back()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!eligibiliteResult && !eligibiliteLoading && (
            <>
              <EligibiliteMap coords={coords} loading={localisationEnCours} height={MAP_H} zones={zonesCouverture} />

              <View style={styles.sheet}>
                <Text style={typography.h3 as any}>Test d'éligibilité</Text>
                <Text style={[typography.caption as any, styles.intro]}>
                  Vérifiez si la Fibre est disponible à votre adresse.
                </Text>

                {localisationEnCours && (
                  <View style={styles.locStatus}>
                    <Ionicons name="navigate" size={14} color={colors.info} />
                    <Text style={styles.locStatusText}>Localisation en cours...</Text>
                  </View>
                )}
                {!localisationEnCours && coords && !modeManuel && (
                  <View style={styles.locStatus}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.locStatusText, { color: colors.success }]}>
                      Position détectée, adresse pré-remplie
                    </Text>
                  </View>
                )}
                {localisationRefusee && (
                  <View style={styles.locStatus}>
                    <Ionicons name="information-circle" size={14} color={colors.muted} />
                    <Text style={styles.locStatusText}>
                      Localisation indisponible — indiquez votre adresse manuellement
                    </Text>
                  </View>
                )}

                {!modeManuel ? (
                  <Pressable onPress={() => setModeManuel(true)}>
                    <View style={styles.addressPreview}>
                      <Ionicons name="home-outline" size={18} color={colors.primaryDark} />
                      <Text style={styles.addressPreviewText} numberOfLines={2}>
                        {adresseTexte}
                      </Text>
                      <Ionicons name="create-outline" size={16} color={colors.muted} />
                    </View>
                  </Pressable>
                ) : (
                  <>
                    <View style={styles.rowFields}>
                      <View style={{ flex: 1, marginRight: spacing.sm }}>
                        <TextField
                          label="N°"
                          value={adresse.numero}
                          onChangeText={(v) => setAdresse((a) => ({ ...a, numero: v }))}
                          placeholder="12"
                          keyboardType="number-pad"
                        />
                      </View>
                      <View style={{ flex: 3 }}>
                        <TextField
                          label="Rue / quartier"
                          value={adresse.rue}
                          onChangeText={(v) => setAdresse((a) => ({ ...a, rue: v }))}
                          placeholder="Riviera, Rue K70…"
                        />
                      </View>
                    </View>

                    <Text style={styles.villeLabel}>Commune</Text>
                    <Pressable style={styles.select} onPress={() => setVilleOuvert((v) => !v)}>
                      <Ionicons name="business-outline" size={16} color={colors.muted} />
                      <Text style={styles.selectText}>{adresse.ville || 'Choisir une commune'}</Text>
                      <Ionicons name={villeOuvert ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
                    </Pressable>
                    {villeOuvert && (
                      <View style={styles.dropdown}>
                        {VILLES.map((v) => (
                          <Pressable
                            key={v.nom}
                            style={styles.dropdownRow}
                            onPress={() => {
                              setAdresse((a) => ({ ...a, ville: v.nom, coords: v.coords }));
                              setVilleOuvert(false);
                            }}
                          >
                            <Ionicons
                              name={adresse.ville === v.nom ? 'radio-button-on' : 'radio-button-off'}
                              size={18}
                              color={adresse.ville === v.nom ? colors.primary : colors.muted}
                            />
                            <Text style={styles.dropdownText}>{v.nom}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </>
                )}

                <View style={{ marginTop: spacing.md }}>
                  <Button label="Vérifier mon éligibilité" icon="search" onPress={onVerifier} disabled={!formValide} />
                </View>
                <View style={{ marginTop: spacing.sm }}>
                  <Button
                    label="Me géolocaliser"
                    variant="ghost"
                    icon="navigate-outline"
                    onPress={localiserMaintenant}
                  />
                </View>
                {!modeManuel && (
                  <View style={{ marginTop: spacing.sm }}>
                    <Button label="Choisir une commune" variant="ghost" onPress={() => setModeManuel(true)} />
                  </View>
                )}
              </View>
            </>
          )}

          {eligibiliteLoading && (
            <View style={styles.loadingWrap}>
              <View style={styles.loadingSpinner}>
                <Ionicons name="wifi" size={30} color={colors.primary} />
              </View>
              <Text style={[typography.h3 as any, { marginTop: spacing.lg, textAlign: 'center' }]}>
                Vérification en cours...
              </Text>
              <Text style={[typography.caption as any, { textAlign: 'center', marginTop: spacing.xs }]}>
                Nous consultons notre réseau fibre pour votre adresse.
              </Text>
            </View>
          )}

          {config && eligibiliteResult && !eligibiliteLoading && (
            <View style={styles.resultWrap}>
              <View style={[styles.resultIcon, { backgroundColor: config.bg }]}>
                <Ionicons name={config.icon} size={40} color={config.color} />
              </View>
              <Text style={[typography.h2 as any, styles.resultTitle]}>{config.titre}</Text>
              {!!config.soustitre && (
                <Text style={[typography.body as any, styles.resultSubtitle]}>{config.soustitre}</Text>
              )}

              <Card style={styles.addressCard}>
                <View style={styles.addressCardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressCardLabel}>ADRESSE TESTÉE</Text>
                    <Text style={typography.bodyBold as any}>
                      {eligibiliteResult.adresse.numero} {eligibiliteResult.adresse.rue}, {eligibiliteResult.adresse.ville}
                    </Text>
                  </View>
                  <Pressable onPress={recommencer}>
                    <Text style={styles.modifierLink}>Modifier</Text>
                  </Pressable>
                </View>
              </Card>

              {eligibiliteResult.statut === 'eligible' && (
                <View style={styles.offresSection}>
                  <Text style={[typography.h3 as any, styles.offresTitle]}>Comment continuer ?</Text>
                  <Text style={[typography.caption as any, { marginBottom: spacing.md }]}>
                    Deux possibilités selon votre situation.
                  </Text>

                  <Card style={styles.optionCard}>
                    <View style={styles.optionHead}>
                      <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
                      <Text style={styles.optionTitle}>J'ai déjà ma box</Text>
                    </View>
                    <Text style={[typography.caption as any, { marginBottom: spacing.sm }]}>
                      Saisissez le code inscrit sur votre box pour accéder à votre espace.
                    </Text>
                    <TextField
                      label="Code de la box"
                      value={codeBox}
                      onChangeText={setCodeBox}
                      placeholder="BOX-CI-77492"
                      autoCapitalize="characters"
                      maxLength={14}
                      icon="barcode-outline"
                    />
                    <Button
                      label="Continuer"
                      icon="arrow-forward"
                      iconPosition="right"
                      disabled={codeBox.trim().length < 6}
                      onPress={onContinuerAvecCode}
                    />
                  </Card>

                  <Card style={[styles.optionCard, { marginTop: spacing.md }]}>
                    <View style={styles.optionHead}>
                      <Ionicons name="construct-outline" size={20} color={colors.primary} />
                      <Text style={styles.optionTitle}>Je n'ai pas de box</Text>
                    </View>
                    <Text style={[typography.caption as any, { marginBottom: spacing.md }]}>
                      Demandez l'installation d'un poste par un technicien Orange.
                    </Text>
                    <Button
                      label="Demander une installation"
                      variant="secondary"
                      icon="calendar-outline"
                      onPress={onDemanderInstallation}
                    />
                  </Card>
                </View>
              )}

              {eligibiliteResult.statut === 'zone_a_etudier' && (
                <Card style={styles.resultCard}>
                  <Text style={typography.body as any}>
                    Votre zone fait partie d'un déploiement prévu.{' '}
                    {eligibiliteResult.dateDisponibilitePrevue}. Nous vous notifierons dès que la fibre sera
                    disponible.
                  </Text>
                </Card>
              )}
              {eligibiliteResult.statut === 'non_eligible' && (
                <Card style={styles.resultCard}>
                  <Text style={typography.body as any}>
                    La fibre n'est pas encore disponible à cette adresse. Un conseiller Cortex peut vous proposer
                    une alternative.
                  </Text>
                </Card>
              )}

              {eligibiliteResult.statut !== 'eligible' && (
                <View style={{ marginTop: spacing.lg, width: '100%' }}>
                  <Button label="Vérifier une autre adresse" variant="ghost" onPress={recommencer} />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const MAP_H = 260;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },
  locStatus: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  locStatusText: { marginLeft: spacing.xs, fontSize: 12, color: colors.info, fontWeight: '600' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -radius.xl,
    padding: spacing.lg,
  },
  intro: { marginBottom: spacing.lg },
  rowFields: { flexDirection: 'row' },
  villeLabel: { ...(typography.bodyBold as any), marginBottom: spacing.xs + 2 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  selectText: { flex: 1, marginLeft: spacing.sm, fontSize: 15, color: colors.ink, fontWeight: '600' },
  dropdown: {
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownText: { marginLeft: spacing.sm, fontSize: 14, color: colors.ink },
  addressPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addressPreviewText: { flex: 1, marginHorizontal: spacing.sm, ...(typography.body as any) },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl * 2, paddingHorizontal: spacing.xl },
  loadingSpinner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultWrap: { alignItems: 'center', paddingTop: spacing.xl, paddingHorizontal: spacing.lg },
  resultIcon: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { textAlign: 'center', marginTop: spacing.lg },
  resultSubtitle: { textAlign: 'center', color: colors.slate, marginTop: spacing.xs },
  addressCard: { marginTop: spacing.lg, width: '100%' },
  addressCardRow: { flexDirection: 'row', alignItems: 'center' },
  addressCardLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, marginBottom: 3, letterSpacing: 0.5 },
  modifierLink: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  offresSection: { width: '100%', marginTop: spacing.xl },
  offresTitle: { marginBottom: 2 },
  optionCard: { width: '100%' },
  optionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  optionTitle: { marginLeft: spacing.sm, ...(typography.bodyBold as any), fontSize: 15 },
  offresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  resultCard: { marginTop: spacing.lg, width: '100%' },
});
