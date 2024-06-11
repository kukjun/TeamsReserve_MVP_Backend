import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsEmail, 
} from "class-validator";

export const EmailValidateDecorator = () => {
    return applyDecorators(
        IsEmail({}, {
            message: "이메일은 필수 값이며, Email 형식을 지켜야 합니다.",
        })
    );
};