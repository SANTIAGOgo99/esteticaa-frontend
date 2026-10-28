import { useEffect, useState } from 'react';
import { fetchCatalog, readCatalog, type CatalogKind, type PublicCatalogItem } from '../services/publicCatalog';

export function usePublicCatalog(kind: CatalogKind) {
  const [items, setItems] = useState<PublicCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const cached = await readCatalog(kind);
      if (cached && active) { setItems(cached.items); setLoading(false); setUnavailable(false); }
      try {
        const snapshot = await fetchCatalog(kind);
        if (active) { setItems(snapshot.items); setUnavailable(false); }
      } catch { if (active && !cached) setUnavailable(true); }
      finally { if (active) setLoading(false); }
    };
    void load();
    window.addEventListener('online', load);
    return () => { active = false; window.removeEventListener('online', load); };
  }, [kind]);
  return { items, loading, unavailable };
}
