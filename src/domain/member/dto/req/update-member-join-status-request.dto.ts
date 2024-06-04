import {
    IsBoolean, IsNotEmpty, 
} from "class-validator";
import {
    JoinStatusSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/join-status.swagger.decorator";

export class UpdateMemberJoinStatusRequestDto {
    @JoinStatusSwaggerDecorator()
    @IsNotEmpty()
    @IsBoolean()
    joinStatus: boolean;
}