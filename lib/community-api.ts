import type { CommunityBoard, CommunityPost } from "@/stores/pokedex-store";

type CreateCommunityPostInput = {
  board: CommunityBoard;
  title: string;
  content: string;
  relatedPokemon: string;
  tags: string[];
};

const apiBaseUrl = process.env.NEXT_PUBLIC_COMMUNITY_API_BASE_URL?.replace(/\/$/, "") ?? "";

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Community API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};

export const isCommunityApiEnabled = () => Boolean(apiBaseUrl);

export const listCommunityPosts = async () => requestJson<CommunityPost[]>("/community/posts");

export const createCommunityPostRequest = async (input: CreateCommunityPostInput) =>
  requestJson<CommunityPost>("/community/posts", {
    method: "POST",
    body: JSON.stringify(input)
  });

export const toggleCommunityPostLikeRequest = async (postId: string, delta: number) =>
  requestJson<CommunityPost>(`/community/posts/${postId}/likes`, {
    method: "POST",
    body: JSON.stringify({ delta })
  });

export const toggleCommunityPostPinnedRequest = async (postId: string, pinned: boolean) =>
  requestJson<CommunityPost>(`/community/posts/${postId}/pin`, {
    method: "POST",
    body: JSON.stringify({ pinned })
  });

export const addCommunityCommentRequest = async (postId: string, content: string) =>
  requestJson<CommunityPost>(`/community/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content })
  });
