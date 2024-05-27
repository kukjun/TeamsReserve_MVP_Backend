import {
    ApiProperty,
} from "@nestjs/swagger";
import {
    GetMemberResponseDto, 
} from "@member/dto/res/get-member.response.dto";
import {
    MemberEntity, 
} from "@member/entity/member.entity";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";

export class GetMemberDetailResponseDto
    extends GetMemberResponseDto implements Pick<MemberEntity, "authority" | "joinStatus"> {
    @ApiProperty({
        type: String,
        description: "권한",
        required: true,
        example: MemberAuthority.USER,
    })
    authority: string;
    @ApiProperty({
        type: Boolean,
        description: "가입 여부",
        required: true,
        example: true,
    })
    joinStatus: boolean;
}