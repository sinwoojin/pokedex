const hotTopics = [
  {
    title: "포챔스 메타 급상승 픽",
    description: "요즘 랭크전과 대회 이야기에서 자주 언급되는 포켓몬을 빠르게 훑어보세요."
  },
  {
    title: "카운터·상성 정리",
    description: "약점 타입과 스탯을 같이 보면서 대응 루트를 바로 정리할 수 있게 구성했습니다."
  },
  {
    title: "실전 후기 공유",
    description: "추천 포켓몬을 열어 평점을 남기고, 어떤 픽이 체감이 좋았는지 기록하는 흐름입니다."
  }
] as const;

const boards = [
  {
    name: "메타 브리핑",
    summary: "포챔스 이슈, 급상승 조합, 시즌 핵심 포인트를 모아보는 게시판"
  },
  {
    name: "육성·운용 공유",
    summary: "타입 상성, 특성, 스탯을 기준으로 실전 운용 감각을 정리하는 공간"
  },
  {
    name: "질문 / 답변",
    summary: "입문자도 바로 물어보고 답을 정리할 수 있는 커뮤니티형 정보 허브"
  }
] as const;

const pulseItems = [
  "이번 주 화제 포켓몬부터 랜덤 추천으로 빠르게 훑어보기",
  "검색으로 포켓몬별 상성·진화·능력치까지 바로 확인",
  "평점 기능으로 커뮤니티 체감 메타를 남기고 비교"
] as const;

export function CommunityHighlights() {
  return (
    <section className="community-hub" aria-label="포켓몬 커뮤니티 하이라이트">
      <div className="community-featured-card">
        <p className="section-label">COMMUNITY HUB</p>
        <h2>포챔스 분위기의 포켓몬 정보 공유 홈</h2>
        <p className="community-featured-copy">
          단순 도감이 아니라, 지금 말 많은 포켓몬과 운영 포인트를 같이 읽고 정리하는 커뮤니티형
          랜딩으로 바꿨습니다.
        </p>

        <ul className="pulse-list">
          {pulseItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="community-side-panel">
        <p className="section-label">HOT BOARDS</p>
        <ul className="board-list">
          {boards.map((board) => (
            <li key={board.name}>
              <strong>{board.name}</strong>
              <p>{board.summary}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="community-topic-grid">
        {hotTopics.map((topic) => (
          <article key={topic.title} className="topic-card">
            <p className="section-label">TRENDING</p>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
