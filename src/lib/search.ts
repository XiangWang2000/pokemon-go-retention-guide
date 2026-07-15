export function normalizeSearch(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("zh-TW")
    .replace(/[‐‑‒–—―・·•]/g, "-")
    .replace(/[（）]/g, (char) => (char === "（" ? "(" : ")"))
    .replace(/\s+/g, " ");
}

export function normalizeDexQuery(value: string) {
  const normalized = normalizeSearch(value);
  return /^\d+$/.test(normalized) ? String(Number(normalized)) : normalized;
}

export interface SearchablePokemon {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  formNameEn: string;
  formNameZhTw: string;
  aliases: string[];
  evolutionNames: string[];
}

export function matchesPokemonSearch(item: SearchablePokemon, query: string) {
  const needle = normalizeDexQuery(query);
  if (!needle) return true;
  if (/^\d+$/.test(needle) && String(item.dexNumber) === needle) return true;

  const haystack = [
    item.nameEn,
    item.nameZhTw,
    item.formNameEn,
    item.formNameZhTw,
    `${item.formNameZhTw}${item.nameZhTw}`,
    `${item.formNameEn} ${item.nameEn}`,
    ...item.aliases,
    ...item.evolutionNames,
  ].map(normalizeSearch);
  return haystack.some((value) => value.includes(needle));
}
