// Données factices — en attendant le branchement de l'API réelle
// (développée par l'équipe backend). Toute la donnée transite par
// `services/`, donc il suffira de remplacer l'implémentation là-bas.

import {
  AppareilConnecte,
  Client,
  Dossier,
  DossierEtape,
  Message,
  NotificationItem,
  Offre,
  OptionRecharge,
  Reclamation,
  ReclamationCategorie,
  Technicien,
  WifiInfo,
  ZoneCouverture,
} from './types';

// Catalogue d'offres — repris de la maquette Figma (écran "Nouvelle demande").
// Le tarif de "Fibre UP Max" n'était pas visible sur la capture partagée :
// valeur estimée à ajuster par l'équipe produit.
export const offres: Offre[] = [
  {
    id: 'starter',
    nom: 'Fibre UP Starter',
    debit: '50 Mb/s',
    prixFCFA: 15000,
    avantages: ['Connexion illimitée', 'Ligne téléphonique'],
    icone: 'home',
  },
  {
    id: 'essentiel',
    nom: 'Fibre UP Essentiel',
    debit: '100 Mb/s',
    prixFCFA: 20000,
    avantages: ['Connexion illimitée', 'Ligne téléphonique', '60 min vers OCI'],
    icone: 'tv',
  },
  {
    id: 'plus',
    nom: 'Fibre UP Plus',
    debit: '200 Mb/s',
    prixFCFA: 25000,
    avantages: ['Connexion illimitée', 'Ligne fixe + IP', '60 min vers OCI'],
    icone: 'game-controller',
  },
  {
    id: 'premium',
    nom: 'Fibre UP Premium',
    debit: '500 Mb/s',
    prixFCFA: 65000,
    avantages: ['Connexion illimitée', 'Antivirus inclus', 'Ligne fixe + IP'],
    icone: 'briefcase',
  },
  {
    id: 'max',
    nom: 'Fibre UP Max',
    debit: '1 Gb/s',
    prixFCFA: 100000,
    avantages: ['Connexion illimitée', 'Antivirus inclus', 'Ligne fixe + IP', 'Support prioritaire'],
    icone: 'rocket',
  },
];

export const client: Client = {
  id: 'cli-1',
  prenom: 'Yves',
  nom: 'Goabi',
  telephone: '07 07 12 34 56',
  email: 'yves.goabi@example.com',
  adresse: {
    numero: '3',
    rue: 'Riviera, Cocody Deux Plateaux, Rue K70',
    codePostal: '00225',
    ville: 'Abidjan',
    coords: { latitude: 5.3599, longitude: -3.9967 },
  },
};

// Zones de couverture fibre autour d'Abidjan — affichées sur la carte
// d'éligibilité (comme l'app "Ma Box" : on voit les quartiers couverts ou non).
// Contours simplifiés (rectangles), à remplacer par les vrais polygones réseau.
function rect(latMin: number, latMax: number, lngMin: number, lngMax: number) {
  return [
    { latitude: latMax, longitude: lngMin },
    { latitude: latMax, longitude: lngMax },
    { latitude: latMin, longitude: lngMax },
    { latitude: latMin, longitude: lngMin },
  ];
}

export const zonesCouverture: ZoneCouverture[] = [
  { id: 'z-cocody', nom: 'Cocody – Deux Plateaux', statut: 'eligible', contour: rect(5.348, 5.372, -4.006, -3.982) },
  { id: 'z-plateau', nom: 'Le Plateau', statut: 'eligible', contour: rect(5.316, 5.336, -4.026, -4.006) },
  { id: 'z-marcory', nom: 'Marcory – Zone 4', statut: 'eligible', contour: rect(5.278, 5.300, -4.008, -3.986) },
  { id: 'z-yopougon', nom: 'Yopougon', statut: 'zone_a_etudier', contour: rect(5.320, 5.352, -4.092, -4.052) },
  { id: 'z-treichville', nom: 'Treichville', statut: 'zone_a_etudier', contour: rect(5.288, 5.306, -4.028, -4.008) },
  { id: 'z-abobo', nom: 'Abobo', statut: 'non_eligible', contour: rect(5.408, 5.446, -4.040, -4.004) },
  { id: 'z-portbouet', nom: 'Port-Bouët', statut: 'non_eligible', contour: rect(5.238, 5.262, -3.960, -3.918) },
];

// Numéro de ligne fixe rattaché à la box fibre du client (distinct de son mobile).
export const numeroLigneFixe = '27 225 792 91';

// Code d'identification de la box (utile pour le support technique).
export const codeBox = 'BOX-CI-77492';

export const technicien: Technicien = {
  id: 'tech-1',
  prenom: 'Marc',
  nom: 'D.',
  note: 4.8,
  telephone: '07 55 66 77 88',
  vehicule: 'Fourgon Orange',
  immatriculation: 'CI-4521-AB',
  initiales: 'MD',
  heureArriveeEstimee: '~ 25 min',
  // Départ de Yopougon, direction Cocody Deux Plateaux (adresse du client).
  positionDepart: { latitude: 5.3389, longitude: -4.0703 },
  itineraire: [
    { latitude: 5.3389, longitude: -4.0703 }, // Yopougon
    { latitude: 5.3312, longitude: -4.0447 }, // Bd de la Paix
    { latitude: 5.3196, longitude: -4.0206 }, // Pont Henri Konan Bédié
    { latitude: 5.3268, longitude: -3.9993 }, // Marcory / Bd VGE
    { latitude: 5.3405, longitude: -3.9951 }, // Le Plateau
    { latitude: 5.3512, longitude: -3.9966 }, // Bd Latrille
    { latitude: 5.3599, longitude: -3.9967 }, // Cocody Deux Plateaux — client
  ],
};

// Étapes fraîches d'un dossier d'installation — utilisées à la fois par le
// dossier de démo (dossiers[0]) et par la création d'une vraie demande
// (voir store/useAppStore.ts::creerDemandeInstallation), pour que les deux
// parcours affichent exactement les mêmes messages de statut.
export function creerEtapesFraiches(): DossierEtape[] {
  return [
    {
      id: 'adresse_verifiee',
      titre: 'Adresse vérifiée',
      description: 'Votre adresse a été vérifiée.',
      statut: 'en_cours',
    },
    {
      id: 'demande_recue',
      titre: 'Demande reçue',
      description: 'Votre demande a été reçue et est en cours de validation.',
      statut: 'a_venir',
    },
    {
      id: 'demande_validee',
      titre: 'Demande validée',
      description: 'Votre demande a été validée. Vous allez prochainement planifier votre rendez-vous.',
      statut: 'a_venir',
    },
    {
      id: 'rdv_a_planifier',
      titre: 'Rendez-vous à planifier',
      description: 'Choisissez le rendez-vous qui vous convient pour l\'installation.',
      statut: 'a_venir',
    },
    {
      id: 'technicien_assigne',
      titre: 'Technicien assigné',
      description: 'Un technicien a été assigné à votre installation.',
      statut: 'a_venir',
    },
    {
      id: 'installation',
      titre: 'Installation',
      description: 'Le technicien interviendra chez vous.',
      statut: 'a_venir',
    },
    {
      id: 'confirmation_client',
      titre: 'Confirmation client',
      description: 'Confirmez que l\'installation a bien été réalisée par le technicien.',
      statut: 'a_venir',
    },
    {
      id: 'fibre_active',
      titre: 'Fibre active',
      description: 'Votre fibre sera activée et prête à l\'emploi.',
      statut: 'a_venir',
    },
  ];
}

export const etapesDossier: DossierEtape[] = creerEtapesFraiches();

export const dossier: Dossier = {
  id: 'dos-1',
  numero: 'CF-2026-00124',
  type: 'installation_fibre',
  statutGlobal: 'en_cours',
  etapes: etapesDossier,
  adresse: client.adresse,
  interventionAConfirmer: false,
  offre: offres[0],
};

export const dossierDepannage: Dossier = {
  id: 'dos-2',
  numero: 'CF-2026-00125',
  type: 'depannage_box',
  statutGlobal: 'termine',
  etapes: [
    { id: 'demande_recue', titre: 'Demande reçue', description: 'Signalement de panne enregistré.', date: '6 juillet 2026', statut: 'fait' },
    { id: 'demande_validee', titre: 'Diagnostic effectué', description: 'Problème identifié sur la box.', date: '6 juillet 2026', statut: 'fait' },
    { id: 'technicien_assigne', titre: 'Technicien assigné', description: 'Intervention de dépannage planifiée.', date: '6 juillet 2026', statut: 'fait' },
    { id: 'fibre_active', titre: 'Box réparée', description: 'Connexion rétablie.', date: '6 juillet 2026', statut: 'fait' },
  ],
  adresse: client.adresse,
  interventionAConfirmer: false,
  offre: offres[0],
  dateActivation: '6 juillet 2026',
};

export const dossiers: Dossier[] = [dossier, dossierDepannage];

export const messagesInitiaux: Message[] = [
  {
    id: 'm1',
    auteur: 'technicien',
    texte: 'Je suis en route, j\'arrive dans environ 15 minutes.',
    heure: '10:42',
  },
  {
    id: 'm2',
    auteur: 'client',
    texte: 'Merci, je vous attends.',
    heure: '10:45',
  },
];

export const wifiInfo: WifiInfo = {
  actif: true,
  nomReseau: 'Fibre_Yves',
  motDePasse: 'CortexFibre2026!',
  appareilsConnectes: [
    { id: 'ap1', nom: 'iPhone de Yves', actif: true },
    { id: 'ap2', nom: 'Smart TV Salon', actif: true },
    { id: 'ap3', nom: 'PC Portable', actif: true },
  ],
};

export function toggleAppareilMock(appareils: AppareilConnecte[], id: string): AppareilConnecte[] {
  return appareils.map((a) => (a.id === id ? { ...a, actif: !a.actif } : a));
}

export const optionsRecharge: OptionRecharge[] = [
  { id: '1m', dureeLabel: '1 mois', prixFCFA: 15000 },
  { id: '3m', dureeLabel: '3 mois', prixFCFA: 45000 },
  { id: '6m', dureeLabel: '6 mois', prixFCFA: 90000 },
  { id: '12m', dureeLabel: '12 mois', prixFCFA: 180000 },
];

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    titre: 'Votre confirmation est requise',
    description: 'Veuillez valider le plan d\'implantation de la fibre optique pour votre adresse.',
    heure: 'Il y a 10 min',
    categorie: 'action_requise',
    lue: false,
  },
  {
    id: 'n2',
    titre: 'Votre technicien est en route',
    description: 'Marc D. arrivera dans environ 25 minutes à l\'adresse indiquée.',
    heure: '14:30',
    categorie: 'rendez_vous',
    lue: false,
  },
  {
    id: 'n3',
    titre: 'Votre fibre est active',
    description: 'L\'installation a été complétée avec succès. Vos services sont désormais actifs.',
    heure: 'Mar.',
    categorie: 'info',
    lue: true,
  },
  {
    id: 'n4',
    titre: 'Mise à jour du ticket',
    description: 'Un agent a répondu à votre demande concernant la configuration du routeur.',
    heure: 'Lun.',
    categorie: 'info',
    lue: true,
  },
];

export const reclamations: Reclamation[] = [];

export const libellesCategorieReclamation: Record<ReclamationCategorie, string> = {
  connexion_ne_fonctionne_pas: 'Panne de connexion',
  connexion_lente: 'Connexion lente',
  installation_non_realisee: "L'installation n'a pas été réalisée",
  installation_incomplete: "L'installation est incomplète",
  probleme_facture: 'Problème de facturation',
  autre: 'Autre problème',
};

export const descriptionsCategorieReclamation: Record<ReclamationCategorie, string> = {
  connexion_ne_fonctionne_pas: 'Box allumée mais aucun accès à internet',
  connexion_lente: 'La connexion passe mais le débit est très lent',
  installation_non_realisee: 'Le technicien n\'a pas pu terminer ou n\'est pas venu',
  installation_incomplete: 'Matériel manquant ou non fixé correctement',
  probleme_facture: 'Montant, paiement, options',
  autre: 'Précisez ci-dessous',
};

let compteurReclamation = 421;
export function genererNumeroReclamation(): string {
  const n = `SIG-2026-${String(compteurReclamation).padStart(5, '0')}`;
  compteurReclamation += 1;
  return n;
}

let compteurDossier = 126;
export function genererNumeroDossier(): string {
  const n = `CF-2026-${String(compteurDossier).padStart(5, '0')}`;
  compteurDossier += 1;
  return n;
}

export function nouvellesEtapesReclamation(): Reclamation['etapes'] {
  return [
    { id: 'envoyee', titre: 'Enregistré', date: 'Aujourd\'hui', statut: 'fait' },
    { id: 'analyse', titre: 'Analyse en cours', statut: 'en_cours' },
    { id: 'info', titre: 'Information de la suite', statut: 'a_venir' },
  ];
}

// Réponses simulées de l'assistant IA Cortex, choisies par mots-clés.
// Conçu pour être remplacé facilement par un vrai appel au modèle Cortex.
export const suggestionsCortex = [
  'Suis-je éligible à la fibre ?',
  'Où en est mon dossier ?',
  'Mon technicien est en retard',
  'Je veux faire une réclamation',
];

export function reponseCortex(question: string, dossierActuel: Dossier | null): string {
  const q = question.toLowerCase();

  if (q.includes('eligib') || q.includes('éligib')) {
    return 'Pour vérifier votre éligibilité, rendez-vous dans "Tester mon éligibilité" depuis l\'accueil et renseignez votre adresse. Je vous donne une réponse en quelques secondes.';
  }
  if (q.includes('dossier') || q.includes('suivi') || q.includes('où en est')) {
    if (dossierActuel) {
      const etapeEnCours = dossierActuel.etapes.find((e) => e.statut === 'en_cours');
      return etapeEnCours
        ? `Votre dossier ${dossierActuel.numero} en est à l'étape « ${etapeEnCours.titre} ». ${etapeEnCours.description}`
        : `Votre dossier ${dossierActuel.numero} suit son cours normalement.`;
    }
    return 'Je ne trouve pas de dossier en cours. Avez-vous déjà fait une demande d\'installation ?';
  }
  if (q.includes('retard') || q.includes('absent')) {
    return 'Je suis désolé pour ce désagrément. Vous pouvez signaler l\'absence du technicien directement depuis la fiche "Mon technicien", bouton "Signaler une absence". Souhaitez-vous que je vous y emmène ?';
  }
  if (q.includes('réclam') || q.includes('reclam') || q.includes('problème') || q.includes('probleme')) {
    return 'Je peux vous aider à déposer une réclamation. Rendez-vous dans "Mes réclamations" ou dites-moi ce qui ne va pas et je vous guide.';
  }
  if (q.includes('constat') || q.includes('anomalie') || q.includes('coupure')) {
    return 'Je vois que le capteur de votre box a détecté des micro-coupures. Voulez-vous que je transmette ce constat au service technique sous forme de réclamation ?';
  }
  if (q.includes('bonjour') || q.includes('salut') || q.includes('hello')) {
    return 'Bonjour ! Je suis Cortex, votre assistant Orange. Je peux vous aider sur votre éligibilité, le suivi de votre dossier, votre technicien ou une réclamation. Que puis-je faire pour vous ?';
  }
  if (q.includes('merci')) {
    return 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions.';
  }
  return 'Je note votre message. Pour l\'instant je peux surtout vous aider sur : l\'éligibilité fibre, le suivi de dossier, votre technicien et les réclamations. Essayez une des suggestions ci-dessous 👇';
}
