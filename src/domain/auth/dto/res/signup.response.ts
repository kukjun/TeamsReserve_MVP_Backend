import {
    MemberIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/member-id.swagger.decorator";

export class SignupResponse {
        @MemberIdSwaggerDecorator()
        id: string;
}