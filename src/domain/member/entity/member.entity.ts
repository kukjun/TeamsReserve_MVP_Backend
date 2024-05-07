import {
    Member, 
} from "@prisma/client";
import {
    MemberDomain, 
} from "../domain/member.domain";

export class MemberEntity implements Member {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly password: string,
        readonly nickname: string,
        readonly introduce: string | null,
        readonly teamCode: string,
        readonly joinStatus: boolean,
        readonly authority: string,
        readonly createdAt: Date,
        readonly lastModifiedTime: Date,
    ) {
    }

    toDomain() {
        return new MemberDomain(
            this.id,
            this.email,
            this.password,
            this.nickname,
            this.introduce,
            this.teamCode,
            this.joinStatus,
            this.authority,
            this.createdAt,
            this.lastModifiedTime,
        );
    }
}