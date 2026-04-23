import { IsBoolean } from "class-validator";

export class UpdateCommunityPinDto {
  @IsBoolean()
  pinned!: boolean;
}
