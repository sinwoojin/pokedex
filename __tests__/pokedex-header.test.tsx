import { fireEvent, render, screen } from "@testing-library/react";
import { PokedexHeader } from "@/components/pokedex-header";
import { PokedexStoreProvider, usePokedexStore } from "@/providers/pokedex-store-provider";

function QueryValue() {
  const query = usePokedexStore((store) => store.query);
  return <p data-testid="query-value">{query}</p>;
}

describe("PokedexHeader", () => {
  it("updates query on submit", () => {
    render(
      <PokedexStoreProvider>
        <PokedexHeader />
        <QueryValue />
      </PokedexStoreProvider>
    );

    const input = screen.getByLabelText("포켓몬 커뮤니티 검색");
    fireEvent.change(input, { target: { value: "charizard" } });
    fireEvent.click(screen.getByRole("button", { name: "토픽 찾기" }));

    expect(screen.getByTestId("query-value")).toHaveTextContent("charizard");
  });
});
