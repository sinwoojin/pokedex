import { Transform } from "class-transformer";
import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import type { CommunityBoard } from "../community.types";

export class CreateCommunityPostDto {
  @IsIn(["meta", "strategy", "qna"])
  board!: CommunityBoard;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  author?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  relatedPokemon?: string;

  @IsArray()
  @Transform(({ value }: { value: unknown }) => (Array.isArray(value) ? value : []))
  @IsString({ each: true })
  tags!: string[];
}
