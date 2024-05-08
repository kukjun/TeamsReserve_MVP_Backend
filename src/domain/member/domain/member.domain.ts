
export class MemberDomain {
    constructor(dto: Partial<MemberDomain>) {
        Object.assign(this, dto);
    }
    id?: string;
    email: string;
    password: string;
    nickname: string;
    introduce?: string | null;
    teamCode: string;
    joinStatus: boolean;
    authority: string;
    createdAt: Date;
    lastModifiedTime: Date;

}