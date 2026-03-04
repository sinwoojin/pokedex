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

const typeNameKoreanMap: Record<string, string> = {
  normal: "노말",
  fire: "불꽃",
  water: "물",
  electric: "전기",
  grass: "풀",
  ice: "얼음",
  fighting: "격투",
  poison: "독",
  ground: "땅",
  flying: "비행",
  psychic: "에스퍼",
  bug: "벌레",
  rock: "바위",
  ghost: "고스트",
  dragon: "드래곤",
  dark: "악",
  steel: "강철",
  fairy: "페어리"
};

const speciesColorKoreanMap: Record<string, string> = {
  black: "검정",
  blue: "파랑",
  brown: "갈색",
  gray: "회색",
  green: "초록",
  pink: "분홍",
  purple: "보라",
  red: "빨강",
  white: "하양",
  yellow: "노랑"
};

const koreanToEnglishTypeMap = Object.entries(typeNameKoreanMap).reduce<Record<string, string>>(
  (acc, [english, korean]) => {
    acc[korean] = english;
    return acc;
  },
  {}
);

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

export const getTypeColor = (type: string): string => {
  const englishType = koreanToEnglishTypeMap[type] ?? type;
  return typeColorMap[englishType] ?? "#4E6A89";
};

export const getSpeciesColor = (speciesColor: string): string => speciesColorMap[speciesColor] ?? "#4E6A89";

export const getKoreanTypeName = (type: string): string => typeNameKoreanMap[type] ?? type;

export const getKoreanSpeciesColorName = (speciesColor: string): string =>
  speciesColorKoreanMap[speciesColor] ?? speciesColor;

export const allKnownTypes = Object.keys(typeColorMap);
