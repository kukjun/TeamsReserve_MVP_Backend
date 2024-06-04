import {
    MemberIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/member-id.swagger.decorator";

export class UpdateMemberResponseDto {
    @MemberIdSwaggerDecorator()
    id: string;
}