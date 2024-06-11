import {
    AccessTokenSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/access-token.swagger.decorator";

export class SigninResponse {
        @AccessTokenSwaggerDecorator()
        accessToken: string;
}