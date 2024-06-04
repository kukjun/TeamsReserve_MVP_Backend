import {
    EmailSwaggerDecorator,
} from "@root/util/decorators/swagger/member/email.swagger.decorator";
import {
    CodeSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/code.swagger.decorator";
import {
    EmailValidateDecorator, 
} from "@root/util/decorators/validate/member/email.validate.decorator";
import {
    CodeValidateDecorator, 
} from "@root/util/decorators/validate/member/code.validate.decorator";

export class ConfirmEmailRequest {
    @EmailSwaggerDecorator()
    @EmailValidateDecorator()
    email!: string;

    @CodeSwaggerDecorator()
    @CodeValidateDecorator()
    code!: string;
}