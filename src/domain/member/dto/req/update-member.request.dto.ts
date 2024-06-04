import {
    IsOptional, MaxLength, MinLength,
} from "class-validator";
import {
    NicknameSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/nickname.swagger.decorator";
import {
    IntroduceSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/introduce.swagger.decorator";

export class UpdateMemberRequestDto {
    @NicknameSwaggerDecorator()
    @MinLength(3)
    @MaxLength(20)
    @IsOptional()
    nickname?: string;

    @IntroduceSwaggerDecorator()
    @IsOptional()
    introduce?: string;
}