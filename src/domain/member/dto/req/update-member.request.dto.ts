import {
    NicknameSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/nickname.swagger.decorator";
import {
    IntroduceSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/introduce.swagger.decorator";
import {
    NicknameValidateDecorator, 
} from "@root/util/decorators/validate/member/nickname.validate.decorator";
import {
    IntroduceValidateDecorator, 
} from "@root/util/decorators/validate/member/Introduce.validate.decorator";

export class UpdateMemberRequestDto {
    @NicknameSwaggerDecorator()
    @NicknameValidateDecorator()
    nickname?: string;

    @IntroduceSwaggerDecorator()
    @IntroduceValidateDecorator()
    introduce?: string;
}