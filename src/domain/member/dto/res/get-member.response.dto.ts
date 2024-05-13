import {
    MemberEntity,
} from "../../entity/member.entity";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class GetMemberResponseDto implements Pick<MemberEntity, "id"
    | "email"
    | "nickname"
    | "teamCode"
    | "introduce"> {
    @ApiProperty({
        type: String,
        description: "아이디",
        required: true,
        example: "ebbadaa0-8361-448b-93bc-c6f3b6d0c142",
    })
    "id": string;
    @ApiProperty({
        type: String,
        description: "이메일",
        required: true,
        example: "test123@naver.com",
    })
    "email": string;
    @ApiProperty({
        type: String,
        description: "닉네임",
        required: true,
        example: "테스트 닉네임",
    })
    "nickname": string;
    @ApiProperty({
        type: String,
        description: "팀 코드",
        required: true,
        example: "ABCDEF-001",
    })
    "teamCode": string;
    @ApiProperty({
        type: String,
        description: "자기 소개",
        required: false,
        example: "안녕하세요. 지인 소개로 가입하게 되었습니다. 잘부탁드립니다.",
    })
    "introduce": string;
}
