import {
    IsEmail, IsNotEmpty,
} from "class-validator";
import {
    PasswordSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/password.swagger.decorator";
import {
    EmailSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/email.swagger.decorator";

export class SigninRequest {
    @EmailSwaggerDecorator()
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @PasswordSwaggerDecorator()
    @IsNotEmpty()
    password!: string;
}