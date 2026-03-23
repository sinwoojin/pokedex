import { useMutation, useQuery } from "@tanstack/react-query";
import { getDuplicateCandyReward, rollGachaRarity, type GachaRarity } from "@/lib/gacha";
import { fetchPokemonByQuery, fetchPokemonTotalCount } from "@/lib/pokemon";
import { usePokedexStore } from "@/providers/pokedex-store-provider";
import type { SortOrder } from "@/stores/pokedex-store";
import type { PokemonCard } from "@/types/pokemon";
import { useEffect, useRef, useState } from "react";

type DrawResult = {
  card: PokemonCard;
  rarity: GachaRarity;
  duplicateCandy: number;
};

export type RevealState =
  | { phase: "idle" }
  | { phase: "rolling" }
  | { phase: "revealed"; result: DrawResult };

type UseGachaDrawParams = {
  sortOrder: SortOrder;
  onDrawSuccess: (card: PokemonCard) => void;
};

export const useGachaDraw = ({ sortOrder, onDrawSuccess }: UseGachaDrawParams) => {
  const recordGachaDraw = usePokedexStore((store) => store.recordGachaDraw);
  const [revealState, setRevealState] = useState<RevealState>({ phase: "idle" });
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  const totalQuery = useQuery({
    queryKey: ["pokemon-pool-total"],
    queryFn: fetchPokemonTotalCount
  });

  const drawMutation = useMutation({
    mutationFn: async (): Promise<DrawResult> => {
      const total = totalQuery.data;
      if (!total || total < 1) {
        throw new Error("가챠 풀 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      }

      const randomPokemonId = Math.floor(Math.random() * total) + 1;
      const drawResult = await fetchPokemonByQuery(String(randomPokemonId), sortOrder);
      const drawnCard = drawResult[0];

      if (!drawnCard) {
        throw new Error("가챠 결과를 불러오지 못했습니다.");
      }

      const rarity = rollGachaRarity();

      return {
        card: drawnCard,
        rarity,
        duplicateCandy: getDuplicateCandyReward(rarity)
      };
    },
    onMutate: () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
      setRevealState({ phase: "rolling" });
    },
    onSuccess: (result) => {
      recordGachaDraw(result.card, result.rarity, result.duplicateCandy);
      onDrawSuccess(result.card);
      setRevealState({ phase: "revealed", result });

      revealTimerRef.current = setTimeout(() => {
        setRevealState({ phase: "idle" });
      }, 2200);
    },
    onError: () => {
      setRevealState({ phase: "idle" });
    }
  });

  return {
    draw: () => drawMutation.mutate(),
    isDrawing: drawMutation.isPending,
    drawError: drawMutation.error,
    poolError: totalQuery.error,
    isPoolPending: totalQuery.isPending,
    revealState
  };
};
