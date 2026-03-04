import { allKnownTypes, getSpeciesColor, getTypeColor } from "@/lib/pokemon-colors";
import type {
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

const typeDetailCache = new Map<string, Promise<PokemonApiTypeDetail>>();

const fetchTypeDetail = (typeName: string) => {
  const cached = typeDetailCache.get(typeName);
  if (cached) {
    return cached;
  }

  const request = fetchJson<PokemonApiTypeDetail>(`${API_BASE}/type/${typeName}`);
  typeDetailCache.set(typeName, request);
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
    .map(([name, multiplier]) => ({
      name,
      multiplier,
      color: getTypeColor(name)
    }));
};

export const toPokemonCard = async (detail: PokemonApiDetail): Promise<PokemonCard> => {
  const imageUrl =
    detail.sprites.other?.["official-artwork"]?.front_default ?? detail.sprites.front_default ?? null;
  const typeNames = detail.types.map((item) => item.type.name);
  const species = await fetchJson<PokemonSpeciesResponse>(detail.species.url);
  const representativeColor = getSpeciesColor(species.color.name);
  const weaknesses = await resolveWeaknesses(typeNames);

  return {
    id: detail.id,
    name: formatName(detail.name),
    imageUrl,
    types: typeNames,
    height: detail.height,
    weight: detail.weight,
    abilities: detail.abilities.map((item) => formatName(item.ability.name)),
    speciesColor: species.color.name,
    representativeColor,
    weaknesses,
    stats: detail.stats.map((item) => ({ name: item.stat.name, value: item.base_stat }))
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
