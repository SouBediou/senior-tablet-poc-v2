import { useCallback, useEffect, useState } from "react";
import type { Contact } from "../storage/contacts";
import { loadContacts, upsertContact, deleteContact } from "../storage/contacts";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await loadContacts();
      setContacts(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (contact: Contact) => {
    const next = await upsertContact(contact);
    setContacts(next);
  }, []);

  const remove = useCallback(async (id: string) => {
    const next = await deleteContact(id);
    setContacts(next);
  }, []);

  return { contacts, loading, refresh, save, remove };
}
