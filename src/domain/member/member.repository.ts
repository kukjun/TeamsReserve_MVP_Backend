import {
    Injectable,
} from "@nestjs/common";
import {
    PrismaService,
} from "../../config/prisma/prisma.service";
import {
    MemberEntity,
} from "./entity/member.entity";
import {
    PaginateRequestDto,
} from "../../interface/request/paginate.request.dto";

@Injectable()
export class MemberRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) {
    }

    /**
     * paging 검색
     */
    async findMemberByPaging(paginateDto: PaginateRequestDto): Promise<MemberEntity[]> {
        const members = await this.prismaService.member.findMany({
            skip: (paginateDto.page-1) * paginateDto.limit,
            take: paginateDto.limit,
            orderBy: {
                createdAt: "desc",
            },
        });

        return members;
    }

    /**
     * member count 집계
     */
    async findMemberCount(): Promise<number> {
        const count = await this.prismaService.member.count();

        return count;
    }

    /**
     * id 검색
     */
    async findMemberById(id: string): Promise<MemberEntity | null> {
        const member = await this.prismaService.member.findUnique({
            where: {
                id,
            },
        });
        if(!member) return null;

        return member;
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

    /**
     * member 수정
     * @param member
     */
    async updateMember(member: MemberEntity): Promise<string | null> {
        const updatedMember = await this.prismaService.member.update({
            where: {
                id: member.id,
            },
            data: member,
        });

        return updatedMember.id;
    }
}