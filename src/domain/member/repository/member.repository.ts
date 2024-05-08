import {
    Injectable,
} from "@nestjs/common";
import {
    PrismaService,
} from "../../../config/prisma/prisma.service";
import {
    MemberEntity,
} from "../entity/member.entity";

@Injectable()
export class MemberRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) {
    }

    /**
     * email 검색
     * @param email
     */
    async findMemberByEmail(email: string): Promise<MemberEntity | null> {
        const member = await this.prismaService.member.findUnique({
            where: {
                email,
            },
        });
        if(!member) return null;

        return member;
    }

    /**
     * nickname 검색
     * @param nickname
     */
    async findMemberByNickname(nickname: string):Promise<MemberEntity | null> {
        const member = await this.prismaService.member.findUnique({
            where: {
                nickname,
            },
        });
        if(!member) return null;

        return member;
    }

    /**
     * member 저장
     * @param member
     */
    async saveMember(member: MemberEntity): Promise<string | null> {
        const savedMember = await this.prismaService.member.create({
            data: member,
        });
        if(savedMember === null) return null;

        return savedMember.id;
    }
}