import {
    AuthoritySwaggerDecorator,
} from "@root/util/decorators/swagger/member/authority.swagger.decorator";
import {
    AuthorityValidateDecorator,
} from "@root/util/decorators/validate/member/authority.validate.decorator";

export class UpdateMemberAuthorityRequestDto {
    @AuthoritySwaggerDecorator()
    @AuthorityValidateDecorator()
    authority!: string;
}