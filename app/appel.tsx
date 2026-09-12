import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

// Appel « dans l'application » : le client n'a jamais le numéro du
// technicien. Ici c'est une simulation d'écran d'appel ; le vrai appel
// VoIP sera branché plus tard (service Orange).
export default function AppelScreen() {
  const router = useRouter();
  const technicien = useAppStore((s) => s.dossier?.technicien);
  const [secondes, setSecondes] = useState(0);
  const [etat, setEtat] = useState<'appel' | 'en_ligne'>('appel');

  useEffect(() => {
    const t = setTimeout(() => setEtat('en_ligne'), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (etat !== 'en_ligne') return;
    const i = setInterval(() => setSecondes((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [etat]);

  const mmss = `${String(Math.floor(secondes / 60)).padStart(2, '0')}:${String(secondes % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <View style={styles.secure}>
          <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.7)" />
          <Text style={styles.secureText}>Appel sécurisé Orange</Text>
        </View>

        <Avatar initiales={technicien?.initiales ?? 'T'} size={104} background="rgba(255,255,255,0.15)" />
        <Text style={styles.name}>
          {technicien ? `${technicien.prenom} ${technicien.nom}` : 'Technicien'}
        </Text>
        <Text style={styles.status}>{etat === 'appel' ? 'Appel en cours…' : mmss}</Text>
        <Text style={styles.hint}>Le numéro du technicien reste masqué</Text>
      </View>

      <View style={styles.bottom}>
        <Pressable style={styles.hangup} onPress={() => router.back()}>
          <Ionicons name="call" size={28} color={colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
        </Pressable>
        <Text style={styles.hangupLabel}>Raccrocher</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ink, justifyContent: 'space-between' },
  top: { alignItems: 'center', paddingTop: spacing.xxl * 2 },
  secure: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxl },
  secureText: { marginLeft: 6, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  name: { color: colors.white, fontSize: 24, fontWeight: '700', marginTop: spacing.lg },
  status: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: spacing.sm },
  hint: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: spacing.xs },
  bottom: { alignItems: 'center', paddingBottom: spacing.xxl },
  hangup: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangupLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: spacing.sm, fontWeight: '600' },
});
