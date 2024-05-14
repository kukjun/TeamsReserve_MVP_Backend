import {
    ApiProperty, 
} from "@nestjs/swagger";
import {
    IsOptional, MaxLength, MinLength,
} from "class-validator";

export class UpdateMemberRequestDto {
    @ApiProperty({
        type: String,
        description: "닉네임",
        required: false,
        example: "테스트 닉네임",
    })
    @MinLength(3)
    @MaxLength(10)
    @IsOptional()
    nickname?: string;

    @ApiProperty({
        type: String,
        description: "자기 소개",
        required: false,
        example: "안녕하세요. 지인 소개로 가입하게 되었습니다. 잘부탁드립니다.",
    })
    @IsOptional()
    introduce?: string;
}