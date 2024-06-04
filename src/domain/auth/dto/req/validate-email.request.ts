import {
    EmailSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/email.swagger.decorator";
import {
    EmailValidateDecorator, 
} from "@root/util/decorators/validate/member/email.validate.decorator";

export class ValidateEmailRequest {
    @EmailSwaggerDecorator()
    @EmailValidateDecorator()
    email!: string;
}