import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokemonCardGrid } from "@/components/pokemon-card-grid";
import { PokedexStoreProvider } from "@/providers/pokedex-store-provider";
import type { PokedexState } from "@/stores/pokedex-store";
import type { PokemonCard } from "@/types/pokemon";
import type { ComponentProps, ReactNode } from "react";
import type Image from "next/image";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ComponentProps<typeof Image>) => (
    <div data-testid="mock-next-image" aria-label={typeof props.alt === "string" ? props.alt : "pokemon image"} />
  )
}));

jest.mock("@/lib/pokemon", () => ({
  fetchPokemonByQuery: jest.fn(),
  fetchPokemonTotalCount: jest.fn()
}));

import { fetchPokemonByQuery, fetchPokemonTotalCount } from "@/lib/pokemon";

const mockedFetchPokemonByQuery = jest.mocked(fetchPokemonByQuery);
const mockedFetchPokemonTotalCount = jest.mocked(fetchPokemonTotalCount);

const renderWithProviders = (ui: ReactNode, initState?: Partial<PokedexState>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PokedexStoreProvider initState={initState}>{ui}</PokedexStoreProvider>
    </QueryClientProvider>
  );
};

describe("PokemonCardGrid", () => {
  it("draws a pokemon with gacha and allows rating", async () => {
    const sampleResponse = {
      total: 1302,
      cards: [
        {
          id: 25,
          name: "피카츄",
          imageUrl: "https://example.com/pikachu.png",
          types: ["전기"],
          height: 4,
          weight: 60,
          abilities: ["정전기", "피뢰침"],
          speciesColor: "노랑",
          representativeColor: "#E9C84A",
          weaknesses: [{ name: "땅", color: "#E2BF65", multiplier: 2 }],
          evolutionStages: ["피츄", "피카츄", "라이츄"],
          stats: [{ name: "HP", value: 35 }]
        }
      ]
    };

    mockedFetchPokemonTotalCount.mockResolvedValue(sampleResponse.total);
    mockedFetchPokemonByQuery.mockResolvedValue(sampleResponse.cards);

    renderWithProviders(<PokemonCardGrid />);

    await userEvent.click(screen.getByRole("button", { name: "가챠 뽑기" }));

    await waitFor(() => expect(screen.getByText("최근 획득: 피카츄")).toBeInTheDocument());

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("특성")).toBeInTheDocument();
    expect(screen.getByText("피뢰침")).toBeInTheDocument();
    expect(screen.getByText("땅 x2")).toBeInTheDocument();
    expect(screen.getByText("진화 과정")).toBeInTheDocument();
    expect(screen.getByText("피츄")).toBeInTheDocument();

    const fivePointButtons = screen.getAllByRole("button", { name: "피카츄 5점" });
    await userEvent.click(fivePointButtons[0]);
    expect(fivePointButtons[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("shows skeleton cards while search result is loading", () => {
    mockedFetchPokemonTotalCount.mockResolvedValue(1302);
    const pendingPromise = new Promise<{ cards: PokemonCard[]; total: number }>(() => undefined);
    mockedFetchPokemonByQuery.mockReturnValue(pendingPromise.then((value) => value.cards));

    renderWithProviders(<PokemonCardGrid />, { query: "피카", page: 1, sortOrder: "asc" });

    expect(screen.getAllByTestId("pokemon-skeleton").length).toBeGreaterThan(0);
  });

  it("awards candy on duplicate draw", async () => {
    const sampleResponse = {
      total: 1302,
      cards: [
        {
          id: 25,
          name: "피카츄",
          imageUrl: "https://example.com/pikachu.png",
          types: ["전기"],
          height: 4,
          weight: 60,
          abilities: ["정전기", "피뢰침"],
          speciesColor: "노랑",
          representativeColor: "#E9C84A",
          weaknesses: [{ name: "땅", color: "#E2BF65", multiplier: 2 }],
          evolutionStages: ["피츄", "피카츄", "라이츄"],
          stats: [{ name: "HP", value: 35 }]
        }
      ]
    };

    mockedFetchPokemonTotalCount.mockResolvedValue(sampleResponse.total);
    mockedFetchPokemonByQuery.mockResolvedValue(sampleResponse.cards);

    renderWithProviders(<PokemonCardGrid />);

    await userEvent.click(screen.getByRole("button", { name: "가챠 뽑기" }));
    await waitFor(() => expect(screen.getByText("보유 1종")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "가챠 뽑기" }));

    await waitFor(() => expect(screen.getByText(/중복 보상:/)).toBeInTheDocument());
  });
});
