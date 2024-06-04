import {
    IsEmail, IsNotEmpty,
} from "class-validator";
import {
    EmailSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/email.swagger.decorator";
import {
    CodeSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/code.swagger.decorator";

export class ConfirmEmailRequest {
    @EmailSwaggerDecorator()
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @CodeSwaggerDecorator()
    @IsNotEmpty()
    code!: string;
}