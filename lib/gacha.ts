export type GachaRarity = "common" | "rare" | "epic" | "legendary";

const rarityThresholds: Array<{ rarity: GachaRarity; threshold: number }> = [
  { rarity: "legendary", threshold: 0.03 },
  { rarity: "epic", threshold: 0.12 },
  { rarity: "rare", threshold: 0.35 },
  { rarity: "common", threshold: 1 }
];

const duplicateCandyByRarity: Record<GachaRarity, number> = {
  common: 1,
  rare: 3,
  epic: 8,
  legendary: 20
};

const rarityLabelMap: Record<GachaRarity, string> = {
  common: "일반",
  rare: "레어",
  epic: "에픽",
  legendary: "전설"
};

const rarityColorMap: Record<GachaRarity, string> = {
  common: "#8ba8c7",
  rare: "#51b3ff",
  epic: "#d26cff",
  legendary: "#ffd166"
};

export const rollGachaRarity = (randomValue = Math.random()): GachaRarity => {
  for (const candidate of rarityThresholds) {
    if (randomValue <= candidate.threshold) {
      return candidate.rarity;
    }
  }

  return "common";
};

export const getDuplicateCandyReward = (rarity: GachaRarity): number => {
  return duplicateCandyByRarity[rarity];
};

export const getGachaRarityLabel = (rarity: GachaRarity): string => {
  return rarityLabelMap[rarity];
};

export const getGachaRarityColor = (rarity: GachaRarity): string => {
  return rarityColorMap[rarity];
};
