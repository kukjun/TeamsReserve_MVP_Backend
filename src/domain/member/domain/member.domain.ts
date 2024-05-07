import {
    MemberEntity, 
} from "../entity/member.entity";

export class MemberDomain {
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

    toEntity() {
        return new MemberEntity(
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