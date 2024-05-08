import {
    Member,
} from "@prisma/client";

export class MemberEntity implements Member {
    constructor(dto: Partial<MemberEntity>) {
        Object.assign(this, dto);
    }

    id: string;
    email: string;
    password: string;
    nickname: string;
    introduce: string | null;
    teamCode: string;
    joinStatus: boolean;
    authority: string;
    createdAt: Date;
    lastModifiedTime: Date;

}