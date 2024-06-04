import {
    IsNotEmpty, 
} from "class-validator";
import {
    CurrentPasswordSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/current-password.swagger.decorator";
import {
    NewPasswordSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/new-password.swagger.decorator";

export class UpdateMemberPasswordRequestDto {
    // TODO: Password Validate 작업 필요
    @CurrentPasswordSwaggerDecorator()
    @IsNotEmpty()
    currentPassword!: string;

    // TODO: Password Validate 작업 필요
    @NewPasswordSwaggerDecorator()
    @IsNotEmpty()
    newPassword!: string;
}