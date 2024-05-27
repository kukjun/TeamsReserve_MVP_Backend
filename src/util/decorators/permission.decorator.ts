import {
    SetMetadata, 
} from "@nestjs/common";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";

export const ROLES_KEY = "roles";
export const PermissionDecorator = (...roles: MemberAuthority[]) => SetMetadata(ROLES_KEY, roles);