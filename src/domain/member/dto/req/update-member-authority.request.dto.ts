import {
    IsIn, IsNotEmpty, 
} from "class-validator";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";
import {
    AuthoritySwaggerDecorator, 
} from "@root/util/decorators/swagger/member/authority.swagger.decorator";

export class UpdateMemberAuthorityRequestDto {
    @AuthoritySwaggerDecorator()
    @IsNotEmpty()
    @IsIn([MemberAuthority.USER,
        MemberAuthority.MANAGER,])
    authority: string;
}