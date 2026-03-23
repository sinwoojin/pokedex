import { getDuplicateCandyReward, getGachaRarityLabel, rollGachaRarity } from "@/lib/gacha";

describe("gacha utils", () => {
  it("rolls rarity by threshold", () => {
    expect(rollGachaRarity(0.02)).toBe("legendary");
    expect(rollGachaRarity(0.1)).toBe("epic");
    expect(rollGachaRarity(0.3)).toBe("rare");
    expect(rollGachaRarity(0.7)).toBe("common");
  });

  it("returns duplicate reward by rarity", () => {
    expect(getDuplicateCandyReward("common")).toBe(1);
    expect(getDuplicateCandyReward("rare")).toBe(3);
    expect(getDuplicateCandyReward("epic")).toBe(8);
    expect(getDuplicateCandyReward("legendary")).toBe(20);
  });

  it("returns localized rarity labels", () => {
    expect(getGachaRarityLabel("common")).toBe("일반");
    expect(getGachaRarityLabel("legendary")).toBe("전설");
  });
});
