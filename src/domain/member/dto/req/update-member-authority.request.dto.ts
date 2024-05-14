import {
    ApiProperty, 
} from "@nestjs/swagger";
import {
    IsIn, IsNotEmpty, 
} from "class-validator";
import {
    MemberAuthority, 
} from "../../../../types/enums/member.authority.enum";

export class UpdateMemberAuthorityRequestDto {
    @ApiProperty({
        type: String,
        description: "권한",
        required: true,
        example: "USER",
    })
    @IsNotEmpty()
    @IsIn([MemberAuthority.USER,
        MemberAuthority.MANAGER,])
    authority: string;
}