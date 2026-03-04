import type { PokemonApiDetail, PokemonCard, PokemonListResponse } from "@/types/pokemon";

const API_BASE = "https://pokeapi.co/api/v2";

const formatName = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const toPokemonCard = (detail: PokemonApiDetail): PokemonCard => {
  const imageUrl =
    detail.sprites.other?.["official-artwork"]?.front_default ?? detail.sprites.front_default ?? null;

  return {
    id: detail.id,
    name: formatName(detail.name),
    imageUrl,
    types: detail.types.map((item) => item.type.name),
    height: detail.height,
    weight: detail.weight,
    abilities: detail.abilities.map((item) => formatName(item.ability.name)),
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
  return toPokemonCard(detail);
};

export const fetchPokemonPage = async (
  page: number,
  limit: number
): Promise<{ cards: PokemonCard[]; total: number }> => {
  const offset = (page - 1) * limit;
  const list = await fetchJson<PokemonListResponse>(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  const details = await Promise.all(list.results.map((item) => fetchJson<PokemonApiDetail>(item.url)));

  return {
    cards: details.map(toPokemonCard),
    total: list.count
  };
};
