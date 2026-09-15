import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { colors, radius, spacing, typography } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  // Le client ne s'inscrit pas depuis l'app : il est enregistré en base par
  // un technicien (voir futur service de simulation). Ici il se connecte
  // uniquement avec l'identifiant fourni par Orange (n° de ligne fixe /
  // code fibre).
  const [login, setLogin] = useState('');
  const connexionValide = login.trim().length >= 6;

  function onContinuer() {
    if (!connexionValide) return;
    router.replace('/(tabs)/accueil');
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/images/accueil.png')} style={styles.bgImage} resizeMode="cover" />

      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.top} />

          <View style={styles.card}>
            <Text style={[typography.h2 as any, styles.title]}>Bienvenue sur{'\n'}CORTEX FIBER</Text>
            <Text style={[typography.caption as any, styles.subtitle]}>
              Votre compte est créé par l'agent Orange lors de l'installation. Connectez-vous ensuite avec le
              code de votre box.
            </Text>

            <View style={{ marginTop: spacing.lg }}>
              <TextField
                label="Code de votre box"
                value={login}
                onChangeText={setLogin}
                placeholder="BOX-CI-77492"
                autoCapitalize="characters"
                maxLength={14}
                icon="hardware-chip-outline"
              />
              <Text style={styles.hint}>
                Ce code figure sur l'étiquette de votre box et vous est remis par l'agent.
              </Text>
            </View>

            <Button
              label="Se connecter"
              icon="arrow-forward"
              iconPosition="right"
              disabled={!connexionValide}
              onPress={onContinuer}
            />

            <Text style={styles.linkIntro}>Pas encore client Fibre ?</Text>
            <View style={{ marginTop: spacing.sm }}>
              <Button
                label="Tester mon éligibilité"
                variant="secondary"
                onPress={() => router.push('/eligibilite')}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, overflow: 'hidden', backgroundColor: colors.primary },
  bgImage: { position: 'absolute', top: spacing.xxl * 2, left: 0, right: 0, width: '100%', aspectRatio: 1122 / 1402 },
  top: { flex: 1, minHeight: 90 },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xl + spacing.md,
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: spacing.sm },
  linkIntro: { textAlign: 'center', fontSize: 13, color: colors.slate, marginTop: spacing.lg },
  hint: { fontSize: 12, color: colors.muted, marginTop: -spacing.xs, marginBottom: spacing.xs },
});
