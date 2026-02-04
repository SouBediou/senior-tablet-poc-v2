export type Theme = {
  colors: {
    bg: string;
    surface: string;
    surface2: string;
    text: string;
    muted: string;
    border: string;

    primary: string; // violet
    accent: string;  // rose

    danger: string;
    success: string;

    ink: string;     // violet profond (barre nav)
    onInk: string;   // blanc
  };

  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  radius: { md: number; lg: number; xl: number; pill: number };
  font: { body: number; title: number; h1: number; small: number };
  shadow: { card: any };
};

export const lightTheme: Theme = {
  colors: {
    // ✅ Fond général BLANC
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    // Surface secondaire très légère (bleu clair adouci)
    surface2: "rgba(132, 217, 245, 0.35)",

    // Texte violet
    text: "#411C68",
    muted: "rgba(65, 28, 104, 0.70)",
    border: "rgba(65, 28, 104, 0.10)",

    // Charte
    primary: "#411C68", // violet
    accent: "#FF7888",  // pourpre pastel

    danger: "#E5484D",
    success: "#2BAA6B",

    ink: "#411C68",
    onInk: "#FFFFFF",
  },

  spacing: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 40 },
  radius: { md: 14, lg: 18, xl: 24, pill: 999 },
  font: { small: 16, body: 20, title: 26, h1: 32 },

  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    bg: "#12081F",
    surface: "#1A0D2B",
    surface2: "#23113A",

    text: "#FBEFFF",
    muted: "rgba(251, 239, 255, 0.75)",
    border: "rgba(251, 239, 255, 0.12)",

    primary: "#84D9F5",
    accent: "#FF7888",

    danger: "#FF5A5F",
    success: "#35C27B",

    ink: "#411C68",
    onInk: "#FFFFFF",
  },
};
