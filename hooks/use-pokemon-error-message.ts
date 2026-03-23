import { PokemonApiError } from "@/lib/pokemon";

export const usePokemonErrorMessage = () => {
  const resolveErrorMessage = (currentError: unknown, searchMode: boolean): string | null => {
    if (!currentError) {
      return null;
    }

    if (searchMode && currentError instanceof PokemonApiError && currentError.status === 404) {
      return "포켓몬을 찾을 수 없습니다. 이름 또는 번호를 확인해주세요.";
    }

    return "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
  };

  return {
    resolveErrorMessage
  };
};
