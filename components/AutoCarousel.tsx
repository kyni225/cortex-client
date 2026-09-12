import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, spacing } from '@/constants/theme';

export interface Slide {
  id: string;
  /** Image (require('...')). */
  image?: ImageSourcePropType;
  /** true = image seule, plein cadre, sans dégradé ni texte par-dessus. */
  plain?: boolean;
  /** true = logo Cortex (mot-symbole blanc sur fond orange). */
  logo?: boolean;
  /** Couleur derrière l'image (bandes de cadrage). */
  bg?: string;
  titre?: string;
  sous?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  degrade?: [string, string];
}

interface Props {
  slides: Slide[];
  /** Hauteur du bandeau. Par défaut : carré (= largeur de l'écran). */
  height?: number;
  intervalMs?: number;
}

// Bandeau d'images qui défile tout seul (réf. carrousel promo Yango).
// Pleine largeur, reprend la place de la carte sur l'écran Signaler.
export function AutoCarousel({ slides, height, intervalMs = 3500 }: Props) {
  const { width } = useWindowDimensions();
  const h = height ?? Math.round(width * 0.81);
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const pauseRef = useRef(false);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      if (pauseRef.current) return;
      setIndex((i) => {
        const next = (i + 1) % slides.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  function onMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
    pauseRef.current = false;
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          pauseRef.current = true;
        }}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_d, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <SlideCard slide={item} width={width} height={h} />
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((s, i) => (
          <View key={s.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function SlideCard({ slide, width, height }: { slide: Slide; width: number; height: number }) {
  // Logo Cortex — mot-symbole blanc centré sur fond orange.
  if (slide.logo) {
    return (
      <View style={[styles.logoSlide, { width, height }]}>
        <MaterialCommunityIcons name="brain" size={Math.round(height * 0.16)} color={colors.white} />
        <Text style={[styles.logoText, { fontSize: Math.round(height * 0.19) }]}>cortex</Text>
      </View>
    );
  }

  // Image seule (logo, visuel avec texte incrusté…) : remplit le cadre,
  // sans bande visible (léger rognage sur les côtés).
  if (slide.plain && slide.image) {
    return (
      <View style={{ width, height, backgroundColor: slide.bg ?? colors.background }}>
        <Image source={slide.image} style={{ width, height }} resizeMode="cover" />
      </View>
    );
  }

  const contenu = (
    <View style={styles.slideInner}>
      {slide.icon && (
        <View style={styles.iconWrap}>
          <Ionicons name={slide.icon} size={26} color={colors.white} />
        </View>
      )}
      {!!slide.titre && <Text style={styles.titre}>{slide.titre}</Text>}
      {!!slide.sous && <Text style={styles.sous}>{slide.sous}</Text>}
    </View>
  );

  if (slide.image) {
    return (
      <ImageBackground source={slide.image} style={[styles.slide, { height }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(204,97,0,0.75)']}
          style={StyleSheet.absoluteFill}
        />
        {contenu}
      </ImageBackground>
    );
  }

  return (
    <LinearGradient colors={slide.degrade ?? [colors.primaryDark, colors.primary]} style={[styles.slide, { height }]}>
      {contenu}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  slide: { overflow: 'hidden', justifyContent: 'flex-end', padding: spacing.lg },
  slideInner: {},
  logoSlide: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoText: { color: colors.white, fontWeight: '800', letterSpacing: -1, marginLeft: 6 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  titre: { color: colors.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sous: { color: 'rgba(255,255,255,0.92)', fontSize: 14.5, marginTop: 4, maxWidth: '92%' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginHorizontal: 3,
  },
  dotActive: { backgroundColor: colors.primary, width: 18 },
});
