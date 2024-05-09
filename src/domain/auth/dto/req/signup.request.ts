import {
    MemberEntity,
} from "../../../member/entity/member.entity";
import {
    IsEmail, IsNotEmpty, MaxLength, MinLength,
} from "class-validator";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class SignupRequest implements Pick<MemberEntity, "email" | "password" | "nickname" | "teamCode"> {

    @ApiProperty({
        type: String,
        description: "이메일",
        required: true,
        example: "test123@naver.com",
    })
    @IsEmail()
    email!: string;

    // TODO: Password Validate 작업 필요
    @ApiProperty({
        type: String,
        description: "비밀번호",
        required: true,
        example: "test123!@",
    })
    password!: string;
    @ApiProperty({
        type: String,
        description: "닉네임",
        required: true,
        example: "테스트 닉네임",
    })
    @MinLength(3)
    @MaxLength(10)
    @IsNotEmpty()
    nickname!: string;
    @ApiProperty({
        type: String,
        description: "팀 코드",
        required: true,
        example: "ABCDEF-001",
    })
    @IsNotEmpty()
    teamCode!: string;

    @ApiProperty({
        type: String,
        description: "자기 소개",
        required: false,
        example: "안녕하세요. 지인 소개로 가입하게 되었습니다. 잘부탁드립니다.",
    })
    introduce?: string;
}