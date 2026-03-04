export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
};

export type PokemonApiType = {
  slot: number;
  type: {
    name: string;
    url: string;
  };
};

export type PokemonApiDamageRelations = {
  double_damage_from: Array<{ name: string; url: string }>;
  half_damage_from: Array<{ name: string; url: string }>;
  no_damage_from: Array<{ name: string; url: string }>;
};

export type PokemonApiTypeDetail = {
  name: string;
  names: Array<{
    name: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  damage_relations: PokemonApiDamageRelations;
};

export type PokemonApiStat = {
  base_stat: number;
  stat: {
    name: string;
    url: string;
  };
};

export type PokemonApiSprite = {
  front_default: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
    };
  };
};

export type PokemonApiAbility = {
  ability: {
    name: string;
    url: string;
  };
};

export type PokemonApiDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonApiType[];
  abilities: PokemonApiAbility[];
  stats: PokemonApiStat[];
  sprites: PokemonApiSprite;
  species: {
    name: string;
    url: string;
  };
};

export type PokemonSpeciesResponse = {
  names: Array<{
    name: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  color: {
    name: string;
    url: string;
  };
};

export type PokemonAbilityResponse = {
  names: Array<{
    name: string;
    language: {
      name: string;
      url: string;
    };
  }>;
};

export type PokemonWeakness = {
  name: string;
  color: string;
  multiplier: number;
};

export type PokemonCard = {
  id: number;
  name: string;
  imageUrl: string | null;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  speciesColor: string;
  representativeColor: string;
  weaknesses: PokemonWeakness[];
  stats: Array<{ name: string; value: number }>;
};
