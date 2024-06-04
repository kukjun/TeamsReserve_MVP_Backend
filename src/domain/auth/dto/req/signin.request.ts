import {
    PasswordSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/password.swagger.decorator";
import {
    EmailSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/email.swagger.decorator";
import {
    EmailValidateDecorator, 
} from "@root/util/decorators/validate/member/email.validate.decorator";
import {
    PasswordValidateDecorator, 
} from "@root/util/decorators/validate/member/password.validate.decorator";

export class SigninRequest {
    @EmailSwaggerDecorator()
    @EmailValidateDecorator()
    email!: string;

    @PasswordSwaggerDecorator()
    @PasswordValidateDecorator()
    password!: string;
}