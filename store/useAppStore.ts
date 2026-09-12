// Store applicatif (zustand) — état central de l'app CLIENT.
// Toutes les actions qui "parlent au backend" sont regroupées ici et
// simulées avec des données mock. C'est le point d'intégration unique
// à modifier quand l'équipe backend expose ses vraies routes.

import { create } from 'zustand';

import {
  client as clientMock,
  creerEtapesFraiches,
  dossiers as dossiersMock,
  genererNumeroDossier,
  genererNumeroReclamation,
  libellesCategorieReclamation,
  messagesInitiaux,
  notifications as notificationsMock,
  nouvellesEtapesReclamation,
  reponseCortex,
  technicien as technicienMock,
  wifiInfo as wifiInfoMock,
} from '@/data/mockData';
import {
  Adresse,
  AppareilConnecte,
  Client,
  DemandeServiceType,
  Dossier,
  Message,
  NotificationItem,
  Offre,
  Reclamation,
  ReclamationCategorie,
  RendezVous,
  ResultatEligibilite,
  WifiInfo,
} from '@/data/types';
import { verifierEligibilite as verifierEligibiliteService } from '@/services/eligibiliteService';

function heureActuelle(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function dateActivationActuelle(): string {
  const maintenant = new Date();
  return (
    maintenant.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ` à ${heureActuelle().replace(':', 'h')}`
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface DemandeInstallationParams {
  adresse: Adresse;
  offre: Offre;
  telephone: string;
  email: string;
}

interface AppState {
  client: Client;
  dossiers: Dossier[];
  dossier: Dossier | null;
  messagesTechnicien: Message[];
  messagesCortex: Message[];
  reclamations: Reclamation[];
  wifi: WifiInfo;
  notifications: NotificationItem[];

  eligibiliteResult: ResultatEligibilite | null;
  eligibiliteLoading: boolean;
  demandeEnCours: boolean;
  rechargeEnCours: boolean;

  technicienAbsentSignale: boolean;

  verifierEligibilite: (adresse: Adresse) => Promise<ResultatEligibilite>;
  reinitialiserEligibilite: () => void;

  creerDemandeInstallation: (params: DemandeInstallationParams) => Promise<Dossier>;
  dossierParId: (id: string) => Dossier | undefined;

  /** Met à jour l'identité du client (ex: coordonnées saisies lors d'une commande). */
  mettreAJourClient: (updates: Partial<Client>) => void;

  envoyerMessageTechnicien: (texte: string) => void;
  signalerTechnicienAbsent: () => void;
  confirmerFinIntervention: () => void;

  creerReclamation: (categorie: ReclamationCategorie, description: string) => Reclamation;

  /** Envoie une demande au service Orange (raccordement, RDV, dépannage). */
  envoyerDemande: (type: DemandeServiceType) => void;

  /** Fait avancer le dossier courant à l'étape suivante (utilisé par la simulation de suivi). */
  avancerEtapeSuivante: () => void;

  /** Le client choisit son créneau de rendez-vous, ce qui valide cette étape et passe à la suivante. */
  planifierRendezVous: (rdv: RendezVous) => void;

  toggleAppareilWifi: (id: string) => void;
  effectuerRecharge: (optionId: string) => Promise<void>;
  marquerNotificationLue: (id: string) => void;

  envoyerMessageCortex: (texte: string) => void;
}

function remplacerDossier(dossiers: Dossier[], maj: Dossier): Dossier[] {
  return dossiers.map((d) => (d.id === maj.id ? maj : d));
}

export const useAppStore = create<AppState>((set, get) => ({
  client: clientMock,
  dossiers: dossiersMock,
  dossier: dossiersMock[0] ?? null,
  messagesTechnicien: messagesInitiaux,
  messagesCortex: [
    {
      id: 'cortex-0',
      auteur: 'cortex',
      texte: `Bonjour ${clientMock.prenom} 👋 Je suis Cortex, votre assistant Orange. Comment puis-je vous aider aujourd'hui ?`,
      heure: heureActuelle(),
    },
  ],
  reclamations: [],
  wifi: wifiInfoMock,
  notifications: notificationsMock,

  eligibiliteResult: null,
  eligibiliteLoading: false,
  demandeEnCours: false,
  rechargeEnCours: false,

  technicienAbsentSignale: false,

  verifierEligibilite: async (adresse) => {
    set({ eligibiliteLoading: true, eligibiliteResult: null });
    const resultat = await verifierEligibiliteService(adresse);
    set({ eligibiliteResult: resultat, eligibiliteLoading: false });
    return resultat;
  },

  reinitialiserEligibilite: () => set({ eligibiliteResult: null }),

  dossierParId: (id) => get().dossiers.find((d) => d.id === id),

  mettreAJourClient: (updates) => {
    set((state) => ({ client: { ...state.client, ...updates } }));
  },

  creerDemandeInstallation: async ({ adresse, offre }) => {
    set({ demandeEnCours: true });
    await delay(1100);

    const etapes = creerEtapesFraiches();

    const nouveauDossier: Dossier = {
      id: `dos-${Date.now()}`,
      numero: genererNumeroDossier(),
      type: 'installation_fibre',
      statutGlobal: 'en_cours',
      etapes,
      adresse,
      interventionAConfirmer: false,
      offre,
    };

    set((state) => ({
      dossier: nouveauDossier,
      dossiers: [nouveauDossier, ...state.dossiers],
      demandeEnCours: false,
    }));
    return nouveauDossier;
  },

  envoyerMessageTechnicien: (texte) => {
    const nouveauMessage: Message = {
      id: `m-${Date.now()}`,
      auteur: 'client',
      texte,
      heure: heureActuelle(),
    };
    set((state) => ({ messagesTechnicien: [...state.messagesTechnicien, nouveauMessage] }));

    // Réponse simulée du technicien pour une démo vivante.
    setTimeout(() => {
      const reponse: Message = {
        id: `m-${Date.now() + 1}`,
        auteur: 'technicien',
        texte: 'Bien reçu, merci pour votre message !',
        heure: heureActuelle(),
      };
      set((state) => ({ messagesTechnicien: [...state.messagesTechnicien, reponse] }));
    }, 1400);
  },

  signalerTechnicienAbsent: () => {
    set({ technicienAbsentSignale: true });
    const dossier = get().dossier;
    if (dossier) {
      const maj: Dossier = {
        ...dossier,
        etapes: dossier.etapes.map((e) =>
          e.id === 'installation'
            ? { ...e, description: 'Signalement d\'absence transmis, un conseiller revient vers vous.' }
            : e
        ),
      };
      set((state) => ({ dossier: maj, dossiers: remplacerDossier(state.dossiers, maj) }));
    }
  },

  confirmerFinIntervention: () => {
    const dossier = get().dossier;
    if (!dossier) return;
    const dateActivation = dateActivationActuelle();

    const maj: Dossier = {
      ...dossier,
      statutGlobal: 'termine',
      interventionAConfirmer: false,
      dateActivation,
      etapes: dossier.etapes.map((e) => {
        if (e.id === 'installation') return { ...e, statut: 'fait', date: 'Aujourd\'hui' };
        if (e.id === 'confirmation_client') return { ...e, statut: 'fait', date: 'Aujourd\'hui' };
        if (e.id === 'fibre_active') return { ...e, statut: 'fait', date: 'Aujourd\'hui' };
        return e;
      }),
    };
    set((state) => ({ dossier: maj, dossiers: remplacerDossier(state.dossiers, maj) }));
  },

  creerReclamation: (categorie, description) => {
    const reclamation: Reclamation = {
      id: `rec-${Date.now()}`,
      numero: genererNumeroReclamation(),
      categorie,
      description,
      date: 'Aujourd\'hui',
      statut: 'ouverte',
      etapes: nouvellesEtapesReclamation(),
    };
    set((state) => ({ reclamations: [reclamation, ...state.reclamations] }));
    return reclamation;
  },

  envoyerDemande: (type) => {
    const libelles: Record<DemandeServiceType, string> = {
      raccordement: 'Demande de raccordement',
      rendez_vous: 'Demande de rendez-vous',
      depannage: 'Demande de dépannage',
    };
    const notif: NotificationItem = {
      id: `n-${Date.now()}`,
      titre: `${libelles[type]} transmise`,
      description: 'Votre demande a été transmise au service Orange. Un conseiller la traite et revient vers vous.',
      heure: "À l'instant",
      categorie: 'info',
      lue: false,
    };
    set((state) => ({ notifications: [notif, ...state.notifications] }));
  },

  avancerEtapeSuivante: () => {
    const dossier = get().dossier;
    if (!dossier) return;
    const index = dossier.etapes.findIndex((e) => e.statut === 'en_cours');
    if (index === -1) return;
    // Le rendez-vous est choisi par le client lui-même (voir planifierRendezVous),
    // et la confirmation finale nécessite son geste explicite (voir
    // confirmerFinIntervention, déclenché depuis /intervention-confirmation) :
    // la simulation automatique ne doit pas franchir ces étapes à sa place.
    if (dossier.etapes[index].id === 'rdv_a_planifier' || dossier.etapes[index].id === 'confirmation_client') return;
    const suivante = dossier.etapes[index + 1];

    const maj: Dossier = {
      ...dossier,
      etapes: dossier.etapes.map((e, i) => {
        if (i === index) return { ...e, statut: 'fait', date: "Aujourd'hui" };
        if (suivante && i === index + 1) return { ...e, statut: 'en_cours' };
        return e;
      }),
      // Le technicien est affecté dès que cette étape est validée, pour qu'il
      // soit disponible (itinéraire, etc.) au moment de l'étape "Installation".
      ...(dossier.etapes[index].id === 'technicien_assigne' ? { technicien: technicienMock } : null),
      // L'intervention est terminée côté technicien : on demande au client de confirmer.
      ...(dossier.etapes[index].id === 'installation' ? { interventionAConfirmer: true } : null),
      // Dernière étape franchie : le dossier est complet, la fibre est active.
      ...(suivante
        ? null
        : { statutGlobal: 'termine' as const, interventionAConfirmer: false, dateActivation: dateActivationActuelle() }),
    };
    set((state) => ({ dossier: maj, dossiers: remplacerDossier(state.dossiers, maj) }));
  },

  planifierRendezVous: (rdv) => {
    const dossier = get().dossier;
    if (!dossier) return;
    const index = dossier.etapes.findIndex((e) => e.statut === 'en_cours');
    if (index === -1 || dossier.etapes[index].id !== 'rdv_a_planifier') return;
    const suivante = dossier.etapes[index + 1];

    const maj: Dossier = {
      ...dossier,
      rdv,
      etapes: dossier.etapes.map((e, i) => {
        if (i === index) return { ...e, statut: 'fait', date: "Aujourd'hui" };
        if (suivante && i === index + 1) return { ...e, statut: 'en_cours' };
        return e;
      }),
    };
    set((state) => ({ dossier: maj, dossiers: remplacerDossier(state.dossiers, maj) }));
  },

  toggleAppareilWifi: (id) => {
    set((state) => ({
      wifi: {
        ...state.wifi,
        appareilsConnectes: state.wifi.appareilsConnectes.map((a: AppareilConnecte) =>
          a.id === id ? { ...a, actif: !a.actif } : a
        ),
      },
    }));
  },

  effectuerRecharge: async (_optionId) => {
    set({ rechargeEnCours: true });
    await delay(1000);
    set({ rechargeEnCours: false });
  },

  marquerNotificationLue: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, lue: true } : n)),
    }));
  },

  envoyerMessageCortex: (texte) => {
    const messageClient: Message = {
      id: `c-${Date.now()}`,
      auteur: 'client',
      texte,
      heure: heureActuelle(),
    };
    set((state) => ({ messagesCortex: [...state.messagesCortex, messageClient] }));

    setTimeout(() => {
      const reponse: Message = {
        id: `c-${Date.now() + 1}`,
        auteur: 'cortex',
        texte: reponseCortex(texte, get().dossier),
        heure: heureActuelle(),
      };
      set((state) => ({ messagesCortex: [...state.messagesCortex, reponse] }));
    }, 900);
  },
}));

// Ré-export pratique pour les écrans qui n'ont besoin que du technicien mock
// avant qu'un vrai dossier ne soit créé (ex: écran technicien en accès direct).
export { technicienMock, libellesCategorieReclamation };
