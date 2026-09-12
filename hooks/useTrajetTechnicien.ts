// Simule le déplacement du technicien le long de son itinéraire.
// À remplacer par la position temps réel poussée par l'app technicien
// (WebSocket / polling) une fois les deux apps connectées.

import { useEffect, useMemo, useRef, useState } from 'react';

import { Coords } from '@/data/types';

interface Options {
  /** Durée simulée du trajet complet, en minutes (pour l'ETA affiché). */
  dureeMinutes?: number;
  /** Durée réelle de l'animation de bout en bout, en ms. */
  animationMs?: number;
  /** Points intermédiaires ajoutés entre chaque point d'ancrage. */
  densite?: number;
  actif?: boolean;
}

export interface TrajetTechnicien {
  position: Coords | null;
  /** Chemin lissé complet, pour tracer la polyline. */
  chemin: Coords[];
  /** Progression 0 → 1. */
  progression: number;
  etaMinutes: number;
  arrive: boolean;
}

function densifier(points: Coords[], densite: number): Coords[] {
  if (points.length < 2) return points;
  const sortie: Coords[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    for (let s = 0; s < densite; s += 1) {
      const t = s / densite;
      sortie.push({
        latitude: a.latitude + (b.latitude - a.latitude) * t,
        longitude: a.longitude + (b.longitude - a.longitude) * t,
      });
    }
  }
  sortie.push(points[points.length - 1]);
  return sortie;
}

export function useTrajetTechnicien(
  itineraire: Coords[] | undefined,
  { dureeMinutes = 25, animationMs = 90_000, densite = 24, actif = true }: Options = {}
): TrajetTechnicien {
  const chemin = useMemo(
    () => (itineraire && itineraire.length >= 2 ? densifier(itineraire, densite) : []),
    [itineraire, densite]
  );

  const [index, setIndex] = useState(0);
  const debutRef = useRef<number | null>(null);

  useEffect(() => {
    setIndex(0);
    debutRef.current = null;
    if (!actif || chemin.length < 2) return;

    const total = chemin.length - 1;
    const tick = Math.max(250, animationMs / total);
    const id = setInterval(() => {
      setIndex((i) => {
        if (i >= total) {
          clearInterval(id);
          return total;
        }
        return i + 1;
      });
    }, tick);
    return () => clearInterval(id);
  }, [chemin, animationMs, actif]);

  if (chemin.length < 2) {
    return { position: null, chemin: [], progression: 0, etaMinutes: dureeMinutes, arrive: false };
  }

  const total = chemin.length - 1;
  const progression = index / total;
  const arrive = index >= total;
  const etaMinutes = arrive ? 0 : Math.max(1, Math.round(dureeMinutes * (1 - progression)));

  return { position: chemin[index], chemin, progression, etaMinutes, arrive };
}
