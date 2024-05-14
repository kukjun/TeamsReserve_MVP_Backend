import {
    MemberEntity,
} from "../../../src/domain/member/entity/member.entity";
import {
    MemberAuthority,
} from "../../../src/types/enums/member.authority.enum";

export const memberFixture = (encryptedPassword: string, joinStatus: boolean = true): MemberEntity =>
    new MemberEntity(
        {
            email: "fixtureEmail@naver.com",
            password: encryptedPassword,
            nickname: "fixtureName",
            introduce: "fixtureTestIntroduce",
            teamCode: "ABCDEF-001",
            authority: MemberAuthority.USER,
            joinStatus: joinStatus,
        }
    );

export const memberRandomFixture = (encryptedPassword: string, joinStatus: boolean = true, count: number=1): MemberEntity =>
    new MemberEntity(
        {
            email: `fixtureEmail${count}@naver.com`,
            password: encryptedPassword,
            nickname: `fixtureName${count}`,
            introduce: "fixtureTestIntroduce",
            teamCode: "ABCDEF-001",
            authority: MemberAuthority.USER,
            joinStatus: joinStatus,
        }
    );
