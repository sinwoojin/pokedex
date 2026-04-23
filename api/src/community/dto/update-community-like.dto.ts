import { IsIn, IsNumber } from "class-validator";

export class UpdateCommunityLikeDto {
  @IsNumber()
  @IsIn([-1, 1])
  delta!: number;
}
