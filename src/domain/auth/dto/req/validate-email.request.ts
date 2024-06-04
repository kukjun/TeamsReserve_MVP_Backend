import {
    IsEmail, IsNotEmpty, 
} from "class-validator";
import {
    EmailSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/email.swagger.decorator";

export class ValidateEmailRequest {
    @EmailSwaggerDecorator()
    @IsNotEmpty()
    @IsEmail()
    email!: string;
}