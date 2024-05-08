import {
    MemberEntity,
} from "../../../member/entity/member.entity";

export class SignupRequest implements Pick<MemberEntity, "email" | "password" | "nickname" | "teamCode"> {
    constructor(
        readonly email: string,
        readonly password: string,
        readonly nickname: string,
        readonly teamCode: string,
        readonly introduce?: string
    ) {
    }
}