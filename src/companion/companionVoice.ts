import { CompanionId } from "./companionConfig";

export type VoiceStyle = {
  rate: number;
  pitch?: number;
  softener: string[]; // phrases rassurantes
};

export const COMPANION_VOICE: Record<CompanionId, VoiceStyle> = {
  femme: {
    rate: 0.9,
    softener: [
      "Je suis là avec vous.",
      "Prenez votre temps.",
      "Tout va bien."
    ],
  },
  homme: {
    rate: 0.95,
    softener: [
      "D’accord.",
      "On va faire ça ensemble.",
      "Je m’en occupe."
    ],
  },
  dynamique: {
    rate: 1.05,
    softener: [
      "Très bien !",
      "Allons-y ensemble.",
      "C’est parti."
    ],
  },
};
