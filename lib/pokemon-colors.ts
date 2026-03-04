const typeColorMap: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD"
};

const speciesColorMap: Record<string, string> = {
  black: "#2B2B2B",
  blue: "#4A7FE3",
  brown: "#9C6A3A",
  gray: "#8C8F99",
  green: "#4FB66A",
  pink: "#E97CAB",
  purple: "#9C6CD9",
  red: "#DD4B4B",
  white: "#E7EAF0",
  yellow: "#E9C84A"
};

export const getTypeColor = (type: string): string => typeColorMap[type] ?? "#4E6A89";

export const getSpeciesColor = (speciesColor: string): string => speciesColorMap[speciesColor] ?? "#4E6A89";

export const allKnownTypes = Object.keys(typeColorMap);
