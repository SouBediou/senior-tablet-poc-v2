import AsyncStorage from "@react-native-async-storage/async-storage";

export type ContactRole = "family" | "care" | "other";

export type Contact = {
  id: string;
  name: string;
  role: ContactRole;
  phone: string;
  notes?: string;
  favorite?: boolean;
};

const STORAGE_KEY = "contacts.v1";

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function normalizePhone(phone: string): string {
  // Garde chiffres + " + " uniquement (POC simple)
  return phone.replace(/[^\d+]/g, "");
}

export async function loadContacts(): Promise<Contact[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse<Contact[]>(raw, []);

  // Favoris d’abord, puis nom
  return parsed
    .slice()
    .sort(
      (a, b) =>
        Number(!!b.favorite) - Number(!!a.favorite) ||
        a.name.localeCompare(b.name)
    );
}

export async function saveContacts(contacts: Contact[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export async function upsertContact(contact: Contact): Promise<Contact[]> {
  const contacts = await loadContacts();
  const idx = contacts.findIndex((c) => c.id === contact.id);

  const next =
    idx === -1
      ? [contact, ...contacts]
      : contacts.map((c) => (c.id === contact.id ? contact : c));

  await saveContacts(next);
  return next;
}

export async function deleteContact(id: string): Promise<Contact[]> {
  const contacts = await loadContacts();
  const next = contacts.filter((c) => c.id !== id);
  await saveContacts(next);
  return next;
}
