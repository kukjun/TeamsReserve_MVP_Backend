import {
    CurrentPasswordSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/current-password.swagger.decorator";
import {
    NewPasswordSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/new-password.swagger.decorator";
import {
    PasswordValidateDecorator, 
} from "@root/util/decorators/validate/member/password.validate.decorator";

export class UpdateMemberPasswordRequestDto {
    @CurrentPasswordSwaggerDecorator()
    @PasswordValidateDecorator()
    currentPassword!: string;

    @NewPasswordSwaggerDecorator()
    @PasswordValidateDecorator()
    newPassword!: string;
}