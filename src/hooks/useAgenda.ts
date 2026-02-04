import { useCallback, useEffect, useMemo, useState } from "react";
import type { AgendaItem } from "../storage/agenda";
import {
    deleteAgendaItem,
    upsertAgendaItem,
    seedAgendaIfEmpty,
  } from "../storage/agenda";
  

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function useAgenda() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
        const list = await seedAgendaIfEmpty();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (item: AgendaItem) => {
    const next = await upsertAgendaItem(item);
    setItems(next);
  }, []);

  const remove = useCallback(async (id: string) => {
    const next = await deleteAgendaItem(id);
    setItems(next);
  }, []);

  const now = new Date();
  const today = useMemo(() => {
    return items.filter((x) => isSameDay(new Date(x.datetimeISO), now));
  }, [items]);

  const tomorrow = useMemo(() => {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    return items.filter((x) => isSameDay(new Date(x.datetimeISO), t));
  }, [items]);

  const upcoming = useMemo(() => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const afterTomorrow = new Date(start);
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);

    return items.filter((x) => new Date(x.datetimeISO).getTime() >= afterTomorrow.getTime());
  }, [items]);

  return { items, loading, refresh, save, remove, today, tomorrow, upcoming };
}
