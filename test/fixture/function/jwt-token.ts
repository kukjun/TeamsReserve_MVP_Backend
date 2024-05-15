import {
    generateRandomPasswordFunction,
} from "../../../src/util/function/random-password.function";
import {
    bcryptFunction,
} from "../../../src/util/function/bcrypt.function";
import {
    memberFixture,
} from "../entity/member.fixture";
import {
    MemberToken,
} from "../../../src/interface/member-token";
import {
    MemberAuthority,
} from "../../../src/types/enums/member.authority.enum";
import {
    PrismaService,
} from "../../../src/config/prisma/prisma.service";
import {
    JwtService,
} from "@nestjs/jwt";
import {
    ConfigService,
} from "@nestjs/config";
import {
    MemberEntity,
} from "../../../src/domain/member/entity/member.entity";

export const generateJwtToken
    = async (
        prismaService: PrismaService,
        jwtService: JwtService,
        configService: ConfigService,
        authority: string = MemberAuthority.USER
    ): Promise<{
    storedMember: MemberEntity,
    token: string,
    currentPassword: string
}> => {
        const currentPassword = generateRandomPasswordFunction();
        const encryptedPassword = await bcryptFunction.hash(currentPassword, await bcryptFunction.genSalt());
        const member = memberFixture(encryptedPassword, true, authority);
        const storedMember = await prismaService.member.create({
            data: member,
        });
        const payload: MemberToken = {
            id: storedMember.id,
            nickname: storedMember.nickname,
            authority: storedMember.authority,
        };
        const token = jwtService.sign(payload, {
            secret: configService.get<string>("JWT_SECRET_KEY"),
        });

        return {
            storedMember,
            token,
            currentPassword,
        };
    };