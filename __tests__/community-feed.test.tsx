import { fireEvent, render, screen } from "@testing-library/react";
import { CommunityFeed } from "@/components/community-feed";
import { PokedexStoreProvider } from "@/providers/pokedex-store-provider";

describe("CommunityFeed", () => {
  it("creates a post, filters board feed, saves a view, toggles like and pin, and adds a comment", () => {
    render(
      <PokedexStoreProvider>
        <CommunityFeed />
      </PokedexStoreProvider>
    );

    fireEvent.change(screen.getByLabelText("게시판"), { target: { value: "qna" } });
    fireEvent.change(screen.getByLabelText("관련 포켓몬"), { target: { value: "팬텀" } });
    fireEvent.change(screen.getByLabelText("태그"), { target: { value: "팬텀, 질문, 운영" } });
    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "팬텀 운영 질문" } });
    fireEvent.change(screen.getByLabelText("내용"), {
      target: { value: "요즘 팬텀이 메타에서 어느 정도 체감인지 궁금합니다." }
    });
    fireEvent.click(screen.getByRole("button", { name: "글 올리기" }));

    expect(screen.getByText("팬텀 운영 질문")).toBeInTheDocument();
    expect(screen.getByText("관련 포켓몬 · 팬텀")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "질문" }));
    expect(screen.getByText("현재 2개 글 표시 중")).toBeInTheDocument();
    expect(screen.getByText("팬텀 운영 질문")).toBeInTheDocument();
    expect(screen.getByText("#팬텀")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "팬텀" }));
    expect(screen.getByText("현재 1개 글 표시 중")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("커뮤니티 검색"), { target: { value: "팬텀" } });
    expect(screen.getByText("팬텀 운영 질문")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("예: 내 메타 뷰"), { target: { value: "팬텀 뷰" } });
    fireEvent.click(screen.getByRole("button", { name: "뷰 저장" }));
    expect(screen.getByRole("button", { name: "팬텀 뷰" })).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("최신순"), { target: { value: "likes" } });
    expect(screen.getByDisplayValue("추천순")).toBeInTheDocument();
    expect(screen.getByText(/TOP CONTRIBUTORS/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "추천 0" }));
    expect(screen.getByRole("button", { name: "추천 취소 1" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "고정하기" }));
    expect(screen.getByRole("button", { name: "고정 해제" })).toBeInTheDocument();
    expect(screen.getAllByText("고정글").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("팬텀 운영 질문 댓글 입력"), {
      target: { value: "저도 최근에 자주 보입니다." }
    });
    fireEvent.click(screen.getAllByRole("button", { name: "댓글 등록" })[0]);

    expect(screen.getByText("저도 최근에 자주 보입니다.")).toBeInTheDocument();
  });
});
