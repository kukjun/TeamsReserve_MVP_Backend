import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsIn, IsNotEmpty, 
} from "class-validator";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";

export const AuthorityValidateDecorator = () => {
    return applyDecorators(
        IsNotEmpty(),
        IsIn([MemberAuthority.USER,
            MemberAuthority.MANAGER,]),
    );
};