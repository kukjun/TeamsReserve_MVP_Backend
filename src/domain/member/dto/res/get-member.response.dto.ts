import {
    MemberEntity, 
} from "@member/entity/member.entity";
import {
    MemberIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/member-id.swagger.decorator";
import {
    EmailSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/email.swagger.decorator";
import {
    NicknameSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/nickname.swagger.decorator";
import {
    TeamCodeSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/team-code.swagger.decorator";
import {
    IntroduceSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/introduce.swagger.decorator";

export class GetMemberResponseDto implements Pick<MemberEntity, "id"
    | "email"
    | "nickname"
    | "teamCode"
    | "introduce"> {
    @MemberIdSwaggerDecorator()
    id: string;

    @EmailSwaggerDecorator()
    email: string;

    @NicknameSwaggerDecorator()
    nickname: string;

    @TeamCodeSwaggerDecorator()
    teamCode: string;

    @IntroduceSwaggerDecorator()
    introduce: string;
}
