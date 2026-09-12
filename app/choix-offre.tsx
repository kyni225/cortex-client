import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfferCard } from '@/components/OfferCard';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/theme';
import { offres } from '@/data/mockData';
import { Offre } from '@/data/types';

export default function ChoixOffreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ adresse?: string }>();
  const [offreChoisie, setOffreChoisie] = useState<Offre | null>(null);

  function onContinuer() {
    if (!offreChoisie) return;
    router.push({
      pathname: '/commande',
      params: { adresse: params.adresse ?? '', offreId: offreChoisie.id },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Choisir mon offre" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={typography.h3 as any}>Choisissez votre offre Fibre</Text>
        <Text style={[typography.caption as any, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
          Toutes les offres disponibles à votre adresse.
        </Text>

        <View style={styles.grid}>
          {offres.map((o) => (
            <OfferCard
              key={o.id}
              offre={o}
              selected={offreChoisie?.id === o.id}
              onPress={() => setOffreChoisie(o)}
            />
          ))}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Button
            label="Continuer"
            icon="arrow-forward"
            iconPosition="right"
            disabled={!offreChoisie}
            onPress={onContinuer}
          />
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F6F8' },
  scroll: { padding: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
