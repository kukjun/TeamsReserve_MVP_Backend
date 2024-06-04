import {
    GetMemberResponseDto, 
} from "@member/dto/res/get-member.response.dto";
import {
    MemberEntity, 
} from "@member/entity/member.entity";
import {
    AuthoritySwaggerDecorator, 
} from "@root/util/decorators/swagger/member/authority.swagger.decorator";
import {
    JoinStatusSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/join-status.swagger.decorator";

export class GetMemberDetailResponseDto
    extends GetMemberResponseDto implements Pick<MemberEntity, "authority" | "joinStatus"> {
    @AuthoritySwaggerDecorator()
    authority: string;

    @JoinStatusSwaggerDecorator()
    joinStatus: boolean;
}