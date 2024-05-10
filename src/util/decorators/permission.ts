import {
    SetMetadata, 
} from "@nestjs/common";
import {
    MemberAuthority, 
} from "../../types/enums/member.authority.enum";

export const ROLES_KEY = "roles";
export const Roles = (...roles: MemberAuthority[]) => SetMetadata(ROLES_KEY, roles);