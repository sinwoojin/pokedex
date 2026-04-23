export type CommunityBoard = "meta" | "strategy" | "qna";

export type CommunityComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  board: CommunityBoard;
  author: string;
  title: string;
  content: string;
  relatedPokemon: string;
  tags: string[];
  likes: number;
  createdAt: string;
  pinned: boolean;
  comments: CommunityComment[];
};

export type CreateCommunityPostInput = {
  board: CommunityBoard;
  author: string;
  title: string;
  content: string;
  relatedPokemon: string;
  tags: string[];
};
