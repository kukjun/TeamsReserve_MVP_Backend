import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";
import {
    MemberEntity, 
} from "@member/entity/member.entity";

export const memberFixture
    = (encryptedPassword: string, joinStatus: boolean = true, authority: string = MemberAuthority.USER): MemberEntity =>
        new MemberEntity(
            {
                email: "fixtureEmail@naver.com",
                password: encryptedPassword,
                nickname: "fixture",
                introduce: "fixtureTestIntroduce",
                teamCode: "TEAM_CODE",
                authority: authority,
                joinStatus: joinStatus,
            }
        );

export const memberRandomFixture
    = (encryptedPassword: string, joinStatus: boolean = true, count: number = 1): MemberEntity =>
        new MemberEntity(
            {
                email: `fixtureEmail${count}@naver.com`,
                password: encryptedPassword,
                nickname: `fixture${count}`,
                introduce: "fixtureTestIntroduce",
                teamCode: "TEAM_CODE",
                authority: MemberAuthority.USER,
                joinStatus: joinStatus,
            }
        );
