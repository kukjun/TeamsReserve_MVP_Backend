import {
    JoinStatusSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/join-status.swagger.decorator";
import {
    JoinStatusValidateDecorator, 
} from "@root/util/decorators/validate/member/join-status.validate.decorator";

export class UpdateMemberJoinStatusRequestDto {
    @JoinStatusSwaggerDecorator()
    @JoinStatusValidateDecorator()
    joinStatus: boolean;
}