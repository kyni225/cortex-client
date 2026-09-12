// Couche service — à remplacer par de vrais appels API par l'équipe backend.
// Toute la logique "métier simulée" vit ici, isolée des écrans.

import { zonesCouverture } from '@/data/mockData';
import { Adresse, Coords, ResultatEligibilite } from '@/data/types';

function delay<T>(value: T, ms = 900): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Test point-dans-polygone (ray casting) pour savoir dans quelle zone de
// couverture tombe une adresse géolocalisée.
function dansPolygone(p: Coords, contour: Coords[]): boolean {
  let dedans = false;
  for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
    const xi = contour[i].longitude;
    const yi = contour[i].latitude;
    const xj = contour[j].longitude;
    const yj = contour[j].latitude;
    const coupe =
      yi > p.latitude !== yj > p.latitude &&
      p.longitude < ((xj - xi) * (p.latitude - yi)) / (yj - yi) + xi;
    if (coupe) dedans = !dedans;
  }
  return dedans;
}

function resultatDepuisZone(adresse: Adresse, statut: ResultatEligibilite['statut']): ResultatEligibilite {
  return {
    statut,
    adresse,
    debitEstime: statut === 'eligible' ? "Jusqu'à 1 Gb/s" : undefined,
    dateDisponibilitePrevue: statut === 'zone_a_etudier' ? 'Estimation : 4 à 8 semaines' : undefined,
  };
}

/**
 * Vérifie l'éligibilité fibre d'une adresse.
 * - Si l'adresse a des coordonnées : on regarde dans quelle zone de
 *   couverture réseau elle tombe (cf. carte d'éligibilité).
 * - Sinon : repli sur une règle basée sur le code postal (pour la démo).
 */
export async function verifierEligibilite(adresse: Adresse): Promise<ResultatEligibilite> {
  const coords = adresse.coords;

  if (coords) {
    const zone = zonesCouverture.find((z) => dansPolygone(coords, z.contour));
    if (zone) return delay(resultatDepuisZone(adresse, zone.statut));
    // Hors de toute zone cartographiée → à l'étude.
    return delay({
      statut: 'zone_a_etudier',
      adresse,
      dateDisponibilitePrevue: 'Estimation : 6 à 10 semaines',
    });
  }

  const dernierChiffre = Number(adresse.codePostal.slice(-1));

  if (Number.isNaN(dernierChiffre) || dernierChiffre % 3 === 0) {
    return delay(resultatDepuisZone(adresse, 'eligible'));
  }
  if (dernierChiffre % 3 === 1) {
    return delay({
      statut: 'zone_a_etudier',
      adresse,
      dateDisponibilitePrevue: 'Estimation : 4 à 8 semaines',
    });
  }
  return delay({ statut: 'non_eligible', adresse });
}
