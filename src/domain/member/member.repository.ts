import {
    Injectable,
} from "@nestjs/common";
import {
    PrismaService, 
} from "@root/config/prisma/prisma.service";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";
import {
    MemberOptionDto, 
} from "@root/interface/request/member-option.dto";
import {
    MemberEntity, 
} from "@member/entity/member.entity";

@Injectable()
export class MemberRepository {
    private readonly prismaMember: PrismaService["member"];

    constructor(
        private readonly prismaService: PrismaService
    ) {
        this.prismaMember = prismaService.member;
    }

    /**
     * paging 검색
     * @param paginateDto
     * @param optionDto
     */
    async findMemberByPaging(paginateDto: PaginateRequestDto, optionDto: MemberOptionDto = null)
        : Promise<MemberEntity[]> {
        if (!optionDto) {
            return await this.prismaMember.findMany({
                skip: (paginateDto.page - 1) * paginateDto.limit,
                take: paginateDto.limit,
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else {
            return await this.prismaMember.findMany({
                skip: (paginateDto.page - 1) * paginateDto.limit,
                take: paginateDto.limit,
                where: {
                    joinStatus: optionDto.joinStatus,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
    }

    /**
     * member count 집계
     * @param optionDto
     */
    async findMemberCount(optionDto: MemberOptionDto = null): Promise<number> {
        if (!optionDto) {
            return await this.prismaMember.count();
        } else {
            return await this.prismaMember.count({
                where: {
                    joinStatus: optionDto.joinStatus,
                },
            });
        }
    }

    /**
     *
     * @param id
     * @param txMember 주입받는 경우 사용하는 tx
     */
    async findMemberById(
        id: string,
        txMember?: PrismaService["member"]
    ): Promise<MemberEntity | null> {
        const prismClientMember = txMember ?? this.prismaMember;
        const member = await prismClientMember.findUnique({
            where: {
                id,
            },
        });
        if (!member) return null;

        return member;
    }

    async findMemberByIdUseTx(id: string): Promise<MemberEntity | null> {
        const member = await this.prismaMember.findUnique({
            where: {
                id,
            },
        });
        if (!member) return null;

        return member;
    }

    /**
     * email 검색
     * @param email
     */
    async findMemberByEmail(email: string): Promise<MemberEntity | null> {
        const member = await this.prismaMember.findUnique({
            where: {
                email,
            },
        });
        if (!member) return null;

        return member;
    }

    /**
     * nickname 검색
     * @param nickname
     */
    async findMemberByNickname(nickname: string): Promise<MemberEntity | null> {
        const member = await this.prismaMember.findUnique({
            where: {
                nickname,
            },
        });
        if (!member) return null;

        return member;
    }

    /**
     * member 저장
     * @param member
     */
    async saveMember(member: MemberEntity): Promise<string | null> {
        const savedMember = await this.prismaMember.create({
            data: member,
        });
        if (savedMember === null) return null;

        return savedMember.id;
    }

    /**
     * member 수정
     * @param member
     */
    async updateMember(member: MemberEntity): Promise<string | null> {
        const updatedMember = await this.prismaMember.update({
            where: {
                id: member.id,
            },
            data: member,
        });

        return updatedMember.id;
    }

    /**
     * member 삭제
     * @param id
     */
    async deleteMember(id: string): Promise<string | null> {
        const updatedMember = await this.prismaMember.delete({
            where: {
                id,
            },
        });

        return updatedMember.id;
    }
}