import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AutoCarousel, Slide } from '@/components/AutoCarousel';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { ReclamationCategorie } from '@/data/types';

const SLIDES: Slide[] = [
  { id: 's1', plain: true, bg: '#FF7900', image: require('../../assets/images/cortex-logo.jpg') },
  { id: 's2', plain: true, bg: '#161719', image: require('../../assets/images/fibre-simple.jpg') },
];

type ProblemeId = Extract<
  ReclamationCategorie,
  'connexion_ne_fonctionne_pas' | 'installation_incomplete' | 'connexion_lente'
>;

const PROBLEMES: {
  id: ProblemeId;
  titre: string;
  sous: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'connexion_ne_fonctionne_pas',
    titre: 'Panne de connexion',
    sous: 'Box allumée mais aucun accès à internet',
    icon: 'cloud-offline-outline',
  },
  {
    id: 'installation_incomplete',
    titre: "Problème d'installation",
    sous: 'Installation non faite, incomplète ou poste fixe',
    icon: 'construct-outline',
  },
  {
    id: 'connexion_lente',
    titre: 'Connexion lente',
    sous: 'La connexion passe mais le débit est trop lent',
    icon: 'speedometer-outline',
  },
];

export default function SignalerScreen() {
  const router = useRouter();

  function ouvrir(id: ProblemeId) {
    if (id === 'installation_incomplete') {
      router.push('/(tabs)/suivi');
      return;
    }
    router.push({ pathname: '/reclamation', params: { categorie: id } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.h1 as any}>Signaler</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AutoCarousel slides={SLIDES} />

        <View style={styles.body}>
          <Text style={[typography.h3 as any, { marginTop: spacing.lg }]}>Signaler un problème</Text>
          <Text style={[typography.caption as any, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
            Choisissez une catégorie. Le signalement est transmis au service Orange.
          </Text>

          {PROBLEMES.map((p) => (
            <Pressable key={p.id} style={styles.card} onPress={() => ouvrir(p.id)}>
              <View style={styles.cardIcon}>
                <Ionicons name={p.icon} size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={typography.bodyBold as any}>{p.titre}</Text>
                <Text style={typography.caption as any}>{p.sous}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          ))}

          <Text style={[typography.bodyBold as any, styles.sectionSpacing]}>Discuter</Text>
          <Pressable style={styles.constatCard} onPress={() => router.push('/cortex')}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.constatTitre}>Discuter</Text>
              <Text style={styles.constatSub}>Échangez directement avec Cortex, l'assistant de votre box.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <View style={{ height: spacing.xxl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  scroll: { paddingTop: spacing.xs },
  body: { paddingHorizontal: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSpacing: { marginTop: spacing.lg, marginBottom: spacing.sm },
  constatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  constatTitre: { color: colors.white, fontWeight: '700', fontSize: 14.5 },
  constatSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
});
