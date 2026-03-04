import {
  allKnownTypes,
  getKoreanSpeciesColorName,
  getKoreanTypeName,
  getSpeciesColor,
  getTypeColor
} from "@/lib/pokemon-colors";
import type {
  PokemonAbilityResponse,
  PokemonApiDetail,
  PokemonApiTypeDetail,
  PokemonCard,
  PokemonListResponse,
  PokemonSpeciesResponse,
  PokemonWeakness
} from "@/types/pokemon";

const API_BASE = "https://pokeapi.co/api/v2";

const formatName = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const statNameMap: Record<string, string> = {
  hp: "HP",
  attack: "공격",
  defense: "방어",
  "special-attack": "특수공격",
  "special-defense": "특수방어",
  speed: "스피드"
};

const typeDetailCache = new Map<string, Promise<PokemonApiTypeDetail>>();
const abilityDetailCache = new Map<string, Promise<PokemonAbilityResponse>>();

const getLocalizedFromNames = (
  names: Array<{ name: string; language: { name: string } }> | undefined,
  fallback: string
) => names?.find((item) => item.language.name === "ko")?.name ?? fallback;

const fetchTypeDetail = (typeName: string) => {
  const cached = typeDetailCache.get(typeName);
  if (cached) {
    return cached;
  }

  const request = fetchJson<PokemonApiTypeDetail>(`${API_BASE}/type/${typeName}`);
  typeDetailCache.set(typeName, request);
  return request;
};

const fetchAbilityDetail = (abilityUrl: string) => {
  const cached = abilityDetailCache.get(abilityUrl);
  if (cached) {
    return cached;
  }

  const request = fetchJson<PokemonAbilityResponse>(abilityUrl);
  abilityDetailCache.set(abilityUrl, request);
  return request;
};

const resolveWeaknesses = async (types: string[]): Promise<PokemonWeakness[]> => {
  const typeDetails = await Promise.all(types.map((type) => fetchTypeDetail(type)));
  const multipliers = new Map<string, number>(allKnownTypes.map((type) => [type, 1]));

  for (const detail of typeDetails) {
    const doubleFrom = new Set(detail.damage_relations.double_damage_from.map((item) => item.name));
    const halfFrom = new Set(detail.damage_relations.half_damage_from.map((item) => item.name));
    const noFrom = new Set(detail.damage_relations.no_damage_from.map((item) => item.name));

    for (const [attackType, value] of multipliers.entries()) {
      let factor = 1;
      if (doubleFrom.has(attackType)) {
        factor = 2;
      }
      if (halfFrom.has(attackType)) {
        factor = 0.5;
      }
      if (noFrom.has(attackType)) {
        factor = 0;
      }
      multipliers.set(attackType, value * factor);
    }
  }

  return Array.from(multipliers.entries())
    .filter(([, multiplier]) => multiplier > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([englishName, multiplier]) => ({
      name: getKoreanTypeName(englishName),
      multiplier,
      color: getTypeColor(englishName)
    }));
};

export const toPokemonCard = async (detail: PokemonApiDetail): Promise<PokemonCard> => {
  const imageUrl =
    detail.sprites.other?.["official-artwork"]?.front_default ?? detail.sprites.front_default ?? null;
  const typeEnglishNames = detail.types.map((item) => item.type.name);
  const species = await fetchJson<PokemonSpeciesResponse>(detail.species.url);
  const abilityDetails = await Promise.all(
    detail.abilities.map((ability) => fetchAbilityDetail(ability.ability.url))
  );
  const localizedAbilities = abilityDetails.map((ability, index) => {
    const fallback = formatName(detail.abilities[index]?.ability.name ?? "");
    return getLocalizedFromNames(ability.names, fallback);
  });

  const localizedPokemonName = getLocalizedFromNames(species.names, formatName(detail.name));
  const representativeColor = getSpeciesColor(species.color.name);
  const weaknesses = await resolveWeaknesses(typeEnglishNames);
  const localizedTypes = typeEnglishNames.map((name) => getKoreanTypeName(name));
  const localizedSpeciesColor = getKoreanSpeciesColorName(species.color.name);

  return {
    id: detail.id,
    name: localizedPokemonName,
    imageUrl,
    types: localizedTypes,
    height: detail.height,
    weight: detail.weight,
    abilities: localizedAbilities,
    speciesColor: localizedSpeciesColor,
    representativeColor,
    weaknesses,
    stats: detail.stats.map((item) => ({
      name: statNameMap[item.stat.name] ?? item.stat.name,
      value: item.base_stat
    }))
  };
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`PokeAPI request failed (${response.status})`);
  }
  return (await response.json()) as T;
};

export const fetchPokemonByNameOrId = async (query: string): Promise<PokemonCard> => {
  const detail = await fetchJson<PokemonApiDetail>(`${API_BASE}/pokemon/${query.toLowerCase()}`);
  return await toPokemonCard(detail);
};

export const fetchPokemonPage = async (
  page: number,
  limit: number
): Promise<{ cards: PokemonCard[]; total: number }> => {
  const offset = (page - 1) * limit;
  const list = await fetchJson<PokemonListResponse>(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  const details = await Promise.all(list.results.map((item) => fetchJson<PokemonApiDetail>(item.url)));
  const cards = await Promise.all(details.map((detail) => toPokemonCard(detail)));

  return {
    cards,
    total: list.count
  };
};
