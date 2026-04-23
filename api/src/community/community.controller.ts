import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CommunityService } from "./community.service";
import { CreateCommunityCommentDto } from "./dto/create-community-comment.dto";
import { CreateCommunityPostDto } from "./dto/create-community-post.dto";
import { UpdateCommunityLikeDto } from "./dto/update-community-like.dto";
import { UpdateCommunityPinDto } from "./dto/update-community-pin.dto";

@Controller("community/posts")
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  async listPosts() {
    return this.communityService.listPosts();
  }

  @Post()
  async createPost(@Body() body: CreateCommunityPostDto) {
    return this.communityService.createPost({
      board: body.board,
      author: body.author?.trim() || "로컬트레이너",
      title: body.title.trim(),
      content: body.content.trim(),
      relatedPokemon: body.relatedPokemon?.trim() || "미지정",
      tags: body.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 4)
    });
  }

  @Post(":postId/likes")
  async updateLikes(@Param("postId") postId: string, @Body() body: UpdateCommunityLikeDto) {
    return this.communityService.updateLikes(postId, body.delta);
  }

  @Post(":postId/pin")
  async updatePinned(@Param("postId") postId: string, @Body() body: UpdateCommunityPinDto) {
    return this.communityService.updatePinned(postId, body.pinned);
  }

  @Post(":postId/comments")
  async addComment(@Param("postId") postId: string, @Body() body: CreateCommunityCommentDto) {
    return this.communityService.addComment(postId, body.author?.trim() || "로컬트레이너", body.content.trim());
  }
}
