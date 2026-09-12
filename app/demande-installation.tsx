import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { offres } from '@/data/mockData';

const PAYS = [
  { code: 'CI', flag: '🇨🇮', dial: '+225' },
  { code: 'FR', flag: '🇫🇷', dial: '+33' },
  { code: 'SN', flag: '🇸🇳', dial: '+221' },
  { code: 'ML', flag: '🇲🇱', dial: '+223' },
  { code: 'BF', flag: '🇧🇫', dial: '+226' },
  { code: 'GH', flag: '🇬🇭', dial: '+233' },
  { code: 'TG', flag: '🇹🇬', dial: '+228' },
  { code: 'BJ', flag: '🇧🇯', dial: '+229' },
];

export default function DemandeInstallationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ situation?: string }>();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [pays, setPays] = useState(PAYS[0]);
  const [paysOuvert, setPaysOuvert] = useState(false);
  const [telephone, setTelephone] = useState('');
  const [situation, setSituation] = useState(params.situation ?? '');
  const [offreId, setOffreId] = useState<string | null>(null);
  const [offreOuvert, setOffreOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const offre = offres.find((o) => o.id === offreId) ?? null;
  const valide =
    prenom.trim() && nom.trim() && telephone.trim().length >= 6 && situation.trim() && offreId;

  async function onEnvoyer() {
    if (!valide) return;
    setEnvoi(true);
    await new Promise((r) => setTimeout(r, 800));
    setEnvoi(false);
    Alert.alert(
      'Demande envoyée',
      "Prenez rendez-vous avec nos services pour l'installation de votre poste. Un conseiller Orange vous recontacte sous 48 h.",
      [{ text: 'OK', onPress: () => router.replace('/') }]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Nouvelle demande" onBack={() => router.back()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={[typography.caption as any, { marginBottom: spacing.lg }]}>
            Installation d'un poste fixe. Renseignez vos informations, un conseiller vous recontacte.
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <TextField label="Prénom" value={prenom} onChangeText={setPrenom} placeholder="Prénom" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Nom" value={nom} onChangeText={setNom} placeholder="Nom" />
            </View>
          </View>

          <Text style={styles.label}>Numéro de téléphone</Text>
          <View style={styles.telRow}>
            <Pressable style={styles.dial} onPress={() => setPaysOuvert((v) => !v)}>
              <Text style={styles.dialFlag}>{pays.flag}</Text>
              <Text style={styles.dialText}>{pays.dial}</Text>
              <Ionicons name={paysOuvert ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} />
            </Pressable>
            <TextInput
              value={telephone}
              onChangeText={setTelephone}
              placeholder="07 07 12 34 56"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              style={styles.telInput}
            />
          </View>
          {paysOuvert && (
            <View style={styles.dropdown}>
              {PAYS.map((p) => (
                <Pressable
                  key={p.code}
                  style={styles.dropdownRow}
                  onPress={() => {
                    setPays(p);
                    setPaysOuvert(false);
                  }}
                >
                  <Text style={styles.dialFlag}>{p.flag}</Text>
                  <Text style={styles.dropdownText}>
                    {p.code} · {p.dial}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ marginTop: spacing.md }}>
            <TextField
              label="Situation géographique"
              value={situation}
              onChangeText={setSituation}
              placeholder="Quartier, rue, repère…"
              icon="location-outline"
            />
          </View>

          <Text style={styles.label}>Offre souhaitée</Text>
          <Pressable style={styles.select} onPress={() => setOffreOuvert((v) => !v)}>
            <Text style={[styles.selectText, !offre && { color: colors.muted }]}>
              {offre ? `${offre.nom} · ${offre.debit}` : 'Choisir une offre'}
            </Text>
            <Ionicons name={offreOuvert ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
          </Pressable>
          {offreOuvert && (
            <View style={styles.dropdown}>
              {offres.map((o) => (
                <Pressable
                  key={o.id}
                  style={styles.dropdownRow}
                  onPress={() => {
                    setOffreId(o.id);
                    setOffreOuvert(false);
                  }}
                >
                  <Ionicons
                    name={offreId === o.id ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={offreId === o.id ? colors.primary : colors.muted}
                  />
                  <Text style={styles.dropdownText}>
                    {o.nom} · {o.debit} · {o.prixFCFA.toLocaleString('fr-FR')} FCFA
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Button label="Annuler" variant="ghost" onPress={() => router.back()} />
            </View>
            <View style={{ flex: 1.4 }}>
              <Button label="Envoyer" icon="paper-plane" iconPosition="right" disabled={!valide} loading={envoi} onPress={onEnvoyer} />
            </View>
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg },
  row: { flexDirection: 'row' },
  label: { ...(typography.bodyBold as any), marginBottom: spacing.xs + 2, marginTop: spacing.xs },
  telRow: { flexDirection: 'row', alignItems: 'stretch' },
  dial: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
  },
  dialFlag: { fontSize: 18, marginRight: 4 },
  dialText: { fontSize: 15, fontWeight: '700', color: colors.ink, marginRight: 2 },
  telInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.ink,
  },
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
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  selectText: { fontSize: 15, color: colors.ink, fontWeight: '600' },
  actions: { flexDirection: 'row', marginTop: spacing.xl },
});
