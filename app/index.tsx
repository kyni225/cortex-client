import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.flex}>
      <ImageBackground source={require('../assets/images/welcome-bg.jpg')} style={styles.bgImage} resizeMode="cover">
        <LinearGradient
          colors={['rgba(20,23,26,0.55)', 'rgba(214,95,0,0.55)', colors.primary]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

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

            <Pressable style={styles.linkWrap} onPress={() => router.push('/eligibilite')}>
              <Text style={styles.link}>
                Pas encore client Fibre ? <Text style={styles.linkBold}>Tester mon éligibilité</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bgImage: { ...StyleSheet.absoluteFill },
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
  linkWrap: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xs },
  link: { fontSize: 13, color: colors.slate },
  linkBold: { color: colors.primaryDark, fontWeight: '700' },
  hint: { fontSize: 12, color: colors.muted, marginTop: -spacing.xs, marginBottom: spacing.xs },
});
