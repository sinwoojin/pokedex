import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokemonCardGrid } from "@/components/pokemon-card-grid";
import { PokedexStoreProvider } from "@/providers/pokedex-store-provider";
import type { PokemonCard } from "@/types/pokemon";
import type { ComponentProps } from "react";
import type Image from "next/image";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ComponentProps<typeof Image>) => (
    <div data-testid="mock-next-image" aria-label={typeof props.alt === "string" ? props.alt : "pokemon image"} />
  )
}));

jest.mock("@/lib/pokemon", () => ({
  fetchPokemonByNameOrId: jest.fn(),
  fetchPokemonPage: jest.fn()
}));

import { fetchPokemonPage } from "@/lib/pokemon";

const mockedFetchPokemonPage = jest.mocked(fetchPokemonPage);

describe("PokemonCardGrid", () => {
  it("opens detail modal when card is clicked", async () => {
    mockedFetchPokemonPage.mockResolvedValueOnce({
      total: 1302,
      cards: [
        {
          id: 25,
          name: "Pikachu",
          imageUrl: "https://example.com/pikachu.png",
          types: ["electric"],
          height: 4,
          weight: 60,
          abilities: ["Static", "Lightning Rod"],
          speciesColor: "yellow",
          representativeColor: "#E9C84A",
          weaknesses: [{ name: "ground", color: "#E2BF65", multiplier: 2 }],
          stats: [{ name: "hp", value: 35 }]
        }
      ]
    });

    render(
      <PokedexStoreProvider>
        <PokemonCardGrid />
      </PokedexStoreProvider>
    );

    await waitFor(() => expect(screen.getByText("Pikachu")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "Pikachu 카드 상세 보기" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Abilities")).toBeInTheDocument();
    expect(screen.getByText("Lightning Rod")).toBeInTheDocument();
    expect(screen.getByText("ground x2")).toBeInTheDocument();
  });

  it("shows skeleton cards while loading", () => {
    const pendingPromise = new Promise<{ cards: PokemonCard[]; total: number }>(() => undefined);
    mockedFetchPokemonPage.mockReturnValue(pendingPromise);

    render(
      <PokedexStoreProvider>
        <PokemonCardGrid />
      </PokedexStoreProvider>
    );

    expect(screen.getAllByTestId("pokemon-skeleton").length).toBeGreaterThan(0);
  });
});
