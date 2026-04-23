import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommunityCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  author?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content!: string;
}
