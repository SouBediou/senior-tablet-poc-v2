import AsyncStorage from "@react-native-async-storage/async-storage";

export type AgendaItemType = "visit" | "med" | "reminder";

export type AgendaItem = {
  id: string;
  type: AgendaItemType;
  title: string;
  datetimeISO: string;
  note?: string;

  // Pour médicaments (POC)
  takenAtISO?: string;         // défini quand "Pris"
  snoozedUntilISO?: string;    // défini quand "Rappeler plus tard"
};

const STORAGE_KEY = "agenda.v1";

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* =======================
   CRUD de base
======================= */

export async function loadAgenda(): Promise<AgendaItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse<AgendaItem[]>(raw, []);

  return parsed
    .slice()
    .sort(
      (a, b) =>
        new Date(a.datetimeISO).getTime() - new Date(b.datetimeISO).getTime()
    );
}

export async function saveAgenda(items: AgendaItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function upsertAgendaItem(item: AgendaItem): Promise<AgendaItem[]> {
  const items = await loadAgenda();
  const idx = items.findIndex((x) => x.id === item.id);

  const next =
    idx === -1
      ? [item, ...items]
      : items.map((x) => (x.id === item.id ? item : x));

  await saveAgenda(next);
  return next;
}

export async function deleteAgendaItem(id: string): Promise<AgendaItem[]> {
  const items = await loadAgenda();
  const next = items.filter((x) => x.id !== id);
  await saveAgenda(next);
  return next;
}

/* =======================
   Helpers temps / IDs
======================= */

function makeId(prefix = "a") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function atTimeTodayISO(hours: number, minutes: number) {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function atTimeTomorrowISO(hours: number, minutes: number) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function inDaysAtTimeISO(days: number, hours: number, minutes: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/* =======================
   Seed DEMO (POC)
======================= */

export async function seedAgendaIfEmpty(): Promise<AgendaItem[]> {
  // 100% autonome : on lit directement la clé
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const existing = safeJsonParse<AgendaItem[]>(raw, []);
  if (existing.length > 0) {
    // On trie pour cohérence d'affichage
    return existing
      .slice()
      .sort(
        (a, b) =>
          new Date(a.datetimeISO).getTime() - new Date(b.datetimeISO).getTime()
      );
  }

  const demo: AgendaItem[] = [
    {
      id: makeId("med"),
      type: "med",
      title: "Médicament du matin",
      datetimeISO: atTimeTodayISO(8, 0),
      note: "1 comprimé",
    },
    {
      id: makeId("visit"),
      type: "visit",
      title: "Visite infirmière",
      datetimeISO: atTimeTodayISO(9, 0),
      note: "Soins du matin",
    },
    {
      id: makeId("med"),
      type: "med",
      title: "Médicament du soir",
      datetimeISO: atTimeTodayISO(20, 0),
      note: "1 comprimé",
    },
    {
      id: makeId("visit"),
      type: "visit",
      title: "Kinésithérapie",
      datetimeISO: atTimeTomorrowISO(14, 30),
      note: "30 minutes",
    },
    {
      id: makeId("reminder"),
      type: "reminder",
      title: "Boire un verre d’eau",
      datetimeISO: inDaysAtTimeISO(3, 10, 0),
      note: "Hydratation",
    },
  ];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  return demo;
}

/* =======================
   Actions médicaments
======================= */

export function markTaken(item: AgendaItem): AgendaItem {
  return {
    ...item,
    takenAtISO: new Date().toISOString(),
    snoozedUntilISO: undefined,
  };
}

export function snooze(item: AgendaItem, minutes: number): AgendaItem {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);

  return {
    ...item,
    snoozedUntilISO: d.toISOString(),
  };
}
