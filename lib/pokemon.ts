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
  PokemonEvolutionChainResponse,
  PokemonListResponse,
  PokemonSpeciesResponse,
  PokemonWeakness
} from "@/types/pokemon";
import type { SortOrder } from "@/stores/pokedex-store";

const API_BASE = "https://pokeapi.co/api/v2";

export class PokemonApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PokemonApiError";
    this.status = status;
  }
}

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
const speciesDetailCache = new Map<string, Promise<PokemonSpeciesResponse>>();
const pokemonCardCache = new Map<number, Promise<PokemonCard>>();

type SearchIndexEntry = {
  id: number;
  englishName: string;
  koreanName: string;
};

const SEARCH_INDEX_STORAGE_KEY = "pokemon-search-index-v1";
let localizedSearchIndexPromise: Promise<SearchIndexEntry[]> | null = null;

const getLocalizedFromNames = (
  names: Array<{ name: string; language: { name: string } }> | undefined,
  fallback: string
) => names?.find((item) => item.language.name === "ko")?.name ?? fallback;

const parsePokemonIdFromUrl = (url: string): number => {
  const id = Number(url.split("/").filter(Boolean).at(-1));
  if (Number.isNaN(id)) {
    throw new Error(`Invalid pokemon resource URL: ${url}`);
  }
  return id;
};

const fetchTypeDetail = (typeName: string) => {
  const cached = typeDetailCache.get(typeName);
  if (cached) {
    return cached;
  }

  const request = fetchJson<PokemonApiTypeDetail>(`${API_BASE}/type/${typeName}`);
  const protectedRequest = request.catch((error) => {
    typeDetailCache.delete(typeName);
    throw error;
  });

  typeDetailCache.set(typeName, protectedRequest);
  return protectedRequest;
};

const fetchAbilityDetail = (abilityUrl: string) => {
  const cached = abilityDetailCache.get(abilityUrl);
  if (cached) {
    return cached;
  }

  const request = fetchJson<PokemonAbilityResponse>(abilityUrl);
  const protectedRequest = request.catch((error) => {
    abilityDetailCache.delete(abilityUrl);
    throw error;
  });

  abilityDetailCache.set(abilityUrl, protectedRequest);
  return protectedRequest;
};

const fetchSpeciesDetail = (speciesUrl: string) => {
  const cached = speciesDetailCache.get(speciesUrl);
  if (cached) {
    return cached;
  }

  const request = fetchJson<PokemonSpeciesResponse>(speciesUrl);
  const protectedRequest = request.catch((error) => {
    speciesDetailCache.delete(speciesUrl);
    throw error;
  });

  speciesDetailCache.set(speciesUrl, protectedRequest);
  return protectedRequest;
};

const buildLocalizedSearchIndex = async (): Promise<SearchIndexEntry[]> => {
  const speciesList = await fetchJson<PokemonListResponse>(`${API_BASE}/pokemon-species?limit=2000&offset=0`);

  const entries = await Promise.all(
    speciesList.results.map(async (speciesItem) => {
      const species = await fetchSpeciesDetail(speciesItem.url);
      return {
        id: parsePokemonIdFromUrl(speciesItem.url),
        englishName: speciesItem.name.toLowerCase(),
        koreanName: getLocalizedFromNames(species.names, formatName(speciesItem.name))
      };
    })
  );

  return entries.sort((a, b) => a.id - b.id);
};

const readSearchIndexFromStorage = (): SearchIndexEntry[] | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SEARCH_INDEX_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SearchIndexEntry[];
  } catch {
    window.localStorage.removeItem(SEARCH_INDEX_STORAGE_KEY);
    return null;
  }
};

const writeSearchIndexToStorage = (entries: SearchIndexEntry[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SEARCH_INDEX_STORAGE_KEY, JSON.stringify(entries));
};

const getLocalizedSearchIndex = async (): Promise<SearchIndexEntry[]> => {
  const cachedStorage = readSearchIndexFromStorage();
  if (cachedStorage) {
    return cachedStorage;
  }

  if (!localizedSearchIndexPromise) {
    localizedSearchIndexPromise = buildLocalizedSearchIndex()
      .then((entries) => {
        writeSearchIndexToStorage(entries);
        return entries;
      })
      .catch((error) => {
        localizedSearchIndexPromise = null;
        throw error;
      });
  }

  return localizedSearchIndexPromise;
};

const collectEvolutionSpeciesUrls = (
  node: PokemonEvolutionChainResponse["chain"],
  acc: string[] = []
): string[] => {
  acc.push(node.species.url);
  for (const next of node.evolves_to) {
    collectEvolutionSpeciesUrls(next, acc);
  }
  return acc;
};

const resolveEvolutionStages = async (evolutionChainUrl: string): Promise<string[]> => {
  const evolutionChain = await fetchJson<PokemonEvolutionChainResponse>(evolutionChainUrl);
  const speciesUrls = collectEvolutionSpeciesUrls(evolutionChain.chain);
  const uniqueUrls = Array.from(new Set(speciesUrls));

  const localizedNames = await Promise.all(
    uniqueUrls.map(async (speciesUrl) => {
      const species = await fetchSpeciesDetail(speciesUrl);
      const fallback = formatName(speciesUrl.split("/").filter(Boolean).at(-1) ?? "포켓몬");
      return getLocalizedFromNames(species.names, fallback);
    })
  );

  return localizedNames;
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
  const species = await fetchSpeciesDetail(detail.species.url);
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
  const evolutionStages = await resolveEvolutionStages(species.evolution_chain.url);

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
    evolutionStages,
    stats: detail.stats.map((item) => ({
      name: statNameMap[item.stat.name] ?? item.stat.name,
      value: item.base_stat
    }))
  };
};

const fetchPokemonCardById = (id: number) => {
  const cached = pokemonCardCache.get(id);
  if (cached) {
    return cached;
  }

  const request = fetchJson<PokemonApiDetail>(`${API_BASE}/pokemon/${id}`).then((detail) => toPokemonCard(detail));
  const protectedRequest = request.catch((error) => {
    pokemonCardCache.delete(id);
    throw error;
  });

  pokemonCardCache.set(id, protectedRequest);
  return protectedRequest;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new PokemonApiError(response.status, `PokeAPI request failed (${response.status})`);
  }
  return (await response.json()) as T;
};

export const fetchPokemonByNameOrId = async (query: string): Promise<PokemonCard> => {
  const detail = await fetchJson<PokemonApiDetail>(`${API_BASE}/pokemon/${query.toLowerCase()}`);
  return await toPokemonCard(detail);
};

export const fetchPokemonByQuery = async (
  query: string,
  sortOrder: SortOrder
): Promise<PokemonCard[]> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  if (/^\d+$/.test(trimmed)) {
    try {
      return [await fetchPokemonByNameOrId(trimmed)];
    } catch (error) {
      if (error instanceof PokemonApiError && error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  const normalizedEnglish = trimmed.toLowerCase();
  const localizedIndex = await getLocalizedSearchIndex();

  const matchedEntries = localizedIndex.filter(
    (entry) => entry.koreanName.includes(trimmed) || entry.englishName.includes(normalizedEnglish)
  );

  if (!matchedEntries.length) {
    return [];
  }

  const sortedMatches = [...matchedEntries].sort((a, b) =>
    sortOrder === "asc" ? a.id - b.id : b.id - a.id
  );

  return await Promise.all(sortedMatches.map((entry) => fetchPokemonCardById(entry.id)));
};

export const fetchPokemonPage = async (
  page: number,
  limit: number,
  sortOrder: SortOrder
): Promise<{ cards: PokemonCard[]; total: number }> => {
  const totalCountResponse = await fetchJson<PokemonListResponse>(`${API_BASE}/pokemon?limit=1&offset=0`);
  const total = totalCountResponse.count;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);

  let offset = (safePage - 1) * limit;
  let pageLimit = limit;

  if (sortOrder === "desc") {
    pageLimit = Math.min(limit, total - (safePage - 1) * limit);
    offset = Math.max(total - (safePage - 1) * limit - pageLimit, 0);
  }

  const list = await fetchJson<PokemonListResponse>(`${API_BASE}/pokemon?limit=${pageLimit}&offset=${offset}`);
  const ids = list.results.map((item) => parsePokemonIdFromUrl(item.url));
  const orderedIds = sortOrder === "desc" ? [...ids].reverse() : ids;
  const cards = await Promise.all(orderedIds.map((id) => fetchPokemonCardById(id)));

  return {
    cards,
    total
  };
};
