import {
    EmailSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/email.swagger.decorator";

export class ValidateEmailResponse {
        @EmailSwaggerDecorator()
        email: string;
}