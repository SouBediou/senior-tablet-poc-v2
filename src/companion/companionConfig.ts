export type CompanionId = "femme" | "homme" | "dynamique";

export const DEFAULT_COMPANION: CompanionId = "femme";

export const COMPANION_AVATARS = {
  femme: require("../../assets/avatars/companion_femme.png"),
  homme: require("../../assets/avatars/companion_homme.png"),
  dynamique: require("../../assets/avatars/companion_dynamique.png"),
};
