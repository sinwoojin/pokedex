import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokemonCardGrid } from "@/components/pokemon-card-grid";
import { PokedexStoreProvider } from "@/providers/pokedex-store-provider";
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
  fetchPokemonPage: jest.fn()
}));

import { fetchPokemonByQuery, fetchPokemonPage } from "@/lib/pokemon";

const mockedFetchPokemonByQuery = jest.mocked(fetchPokemonByQuery);
const mockedFetchPokemonPage = jest.mocked(fetchPokemonPage);

const renderWithProviders = (ui: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PokedexStoreProvider>{ui}</PokedexStoreProvider>
    </QueryClientProvider>
  );
};

describe("PokemonCardGrid", () => {
  it("opens detail modal when card is clicked", async () => {
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

    mockedFetchPokemonPage.mockResolvedValue(sampleResponse);
    mockedFetchPokemonByQuery.mockResolvedValue([]);

    renderWithProviders(<PokemonCardGrid />);

    await waitFor(() => expect(screen.getByText("피카츄")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "피카츄 카드 상세 보기" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("특성")).toBeInTheDocument();
    expect(screen.getByText("피뢰침")).toBeInTheDocument();
    expect(screen.getByText("땅 x2")).toBeInTheDocument();
    expect(screen.getByText("진화 과정")).toBeInTheDocument();
    expect(screen.getByText("피츄")).toBeInTheDocument();
  });

  it("shows skeleton cards while loading", () => {
    const pendingPromise = new Promise<{ cards: PokemonCard[]; total: number }>(() => undefined);
    mockedFetchPokemonPage.mockReturnValue(pendingPromise);
    mockedFetchPokemonByQuery.mockResolvedValue([]);

    renderWithProviders(<PokemonCardGrid />);

    expect(screen.getAllByTestId("pokemon-skeleton").length).toBeGreaterThan(0);
  });
});
