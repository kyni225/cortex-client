import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Technicien } from '@/data/types';

interface Props {
  technicien: Technicien;
  etaMinutes: number;
  arrive: boolean;
  onAppeler: () => void;
  onDiscussion: () => void;
  onDetails: () => void;
}

// Bloc technicien du suivi de course (réf. Yango) : ETA, identité,
// immatriculation, puis appeler / discuter / détails. Sans chrome propre :
// il s'intègre dans le panneau blanc de l'écran Suivi (pas de démarcation).
export function TechnicienTrackingCard({
  technicien,
  etaMinutes,
  arrive,
  onAppeler,
  onDiscussion,
  onDetails,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.etaRow} onPress={onDetails}>
        <Text style={styles.eta}>
          {arrive ? 'Technicien arrivé' : `Arrive dans ≈ ${etaMinutes} min`}
        </Text>
        <Ionicons name="chevron-forward" size={22} color={colors.muted} />
      </Pressable>

      <View style={styles.identiteRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {technicien.prenom} {technicien.nom}
            </Text>
            <Ionicons name="star" size={15} color={colors.warning} style={{ marginLeft: 6 }} />
            <Text style={styles.note}>{technicien.note.toFixed(2)}</Text>
          </View>
          <Text style={styles.vehicule}>{technicien.vehicule}</Text>
          <View style={styles.plaque}>
            <Text style={styles.plaqueText}>{technicien.immatriculation}</Text>
          </View>
        </View>
        <Avatar initiales={technicien.initiales} size={64} />
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.action, styles.actionCall]} onPress={onAppeler}>
          <Ionicons name="call" size={20} color={colors.white} />
          <Text style={[styles.actionText, { color: colors.white }]}>Appeler</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={onDiscussion}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.ink} />
          <Text style={styles.actionText}>Discussion</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={onDetails}>
          <Ionicons name="apps-outline" size={20} color={colors.ink} />
          <Text style={styles.actionText}>Détails</Text>
        </Pressable>
      </View>

      <View style={styles.secureRow}>
        <Ionicons name="lock-closed" size={12} color={colors.muted} />
        <Text style={styles.secureText}>Appel et messages via Orange · numéro du technicien masqué</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.xs },
  etaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eta: { fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
  identiteRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 19, fontWeight: '700', color: colors.ink },
  note: { marginLeft: 3, fontSize: 14, fontWeight: '700', color: colors.slate },
  vehicule: { marginTop: 3, fontSize: 14.5, color: colors.slate },
  plaque: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm + 2,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  plaqueText: { fontSize: 16, fontWeight: '800', letterSpacing: 1.5, color: colors.ink },
  actions: { flexDirection: 'row', marginTop: spacing.xl },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 4,
    marginHorizontal: 4,
  },
  actionCall: { backgroundColor: colors.success },
  actionText: { marginLeft: 6, fontSize: 14, fontWeight: '700', color: colors.ink },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  secureText: { marginLeft: spacing.xs, fontSize: 11.5, color: colors.muted, fontWeight: '600' },
});
