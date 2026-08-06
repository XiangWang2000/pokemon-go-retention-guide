export const pokemonGenerationRanges = [
  { key: "GEN1", label: "第 1 世代", min: 1, max: 151 },
  { key: "GEN2", label: "第 2 世代", min: 152, max: 251 },
  { key: "GEN3", label: "第 3 世代", min: 252, max: 386 },
  { key: "GEN4", label: "第 4 世代", min: 387, max: 493 },
  { key: "GEN5", label: "第 5 世代", min: 494, max: 649 },
  { key: "GEN6", label: "第 6 世代", min: 650, max: 721 },
  { key: "GEN7", label: "第 7 世代", min: 722, max: 809 },
  { key: "GEN8", label: "第 8 世代", min: 810, max: 905 },
  { key: "GEN9", label: "第 9 世代", min: 906, max: 1025 },
] as const;

export type PokemonGenerationKey = (typeof pokemonGenerationRanges)[number]["key"];

export function matchesPokemonGeneration(dexNumber: number, generation: string) {
  if (generation === "ALL") return true;
  const range = pokemonGenerationRanges.find((item) => item.key === generation);
  return range ? dexNumber >= range.min && dexNumber <= range.max : false;
}
