import {
    Injectable,
} from "@nestjs/common";
import {
    PrismaService,
} from "../../config/prisma/prisma.service";
import {
    ReserveEntity,
} from "./entity/reserve.entity";
import {
    SpaceEntity, 
} from "../space/entity/space.entity";
import {
    MemberEntity, 
} from "../member/entity/member.entity";
import {
    PaginateRequestDto, 
} from "../../interface/request/paginate.request.dto";
import {
    ReserveOptionDto, 
} from "../../interface/request/reserve-option.dto";

@Injectable()
export class ReserveRepository {
    private readonly prismaReserve: PrismaService["reserve"];

    constructor(private readonly prismaService: PrismaService) {
        this.prismaReserve = prismaService.reserve;
    }

    async saveReserve(
        reserve: ReserveEntity,
        txReserve?: PrismaService["reserve"]
    ): Promise<string> {
        const prismaReserveClient = txReserve ?? this.prismaReserve;
        const result = await prismaReserveClient.create({
            data: reserve,
        });

        return result.id;
    }

    async findReserveForDuplicateReserve(spaceId: string,
        startTime: Date,
        endTime: Date,
        txReserve?: PrismaService["reserve"]): Promise<ReserveEntity[]> {
        const prismaReserveClient = txReserve ?? this.prismaReserve;
        const reserves = await prismaReserveClient.findMany({
            where: {
                spaceId: spaceId,
                OR: [
                    {
                        startTime: {
                            gte: startTime,
                            lt: endTime,
                        },
                    },
                    {
                        endTime: {
                            gt: startTime,
                            lte: endTime,
                        },
                    },
                    {
                        startTime: {
                            lte: startTime,
                        },
                        endTime: {
                            gte: endTime,
                        },

                    },
                ],
            },
        });

        return reserves;
    }

    async findReserveIncludeMemberAndSpace(reserveId: string, txReserve?: PrismaService["reserve"])
        : Promise<{
        reserve: ReserveEntity,
        space: SpaceEntity,
        member: MemberEntity
    }> {
        const prismaReserveClient = txReserve ?? this.prismaReserve;
        const reserve = await prismaReserveClient.findUnique({
            where: {
                id: reserveId,
            },
            include: {
                Member: true,
                Space: true,
            },
        });

        return {
            member: reserve?.Member,
            space: reserve?.Space,
            reserve: reserve,
        };
    }

    async deleteReserve(reserveId: string, txReserve?: PrismaService["reserve"])
    : Promise<null> {
        const prismaReserveClient = txReserve ?? this.prismaReserve;
        await prismaReserveClient.delete({
            where: {
                id: reserveId,
            },
        });

        return null;
    }

    async findReserve(id: string) {
        const reserve = await this.prismaReserve.findUnique({
            where: {
                id,
            },
        });

        return reserve;
    }

    async findReserveBySpaceIdAndPaging(paginateDto: PaginateRequestDto, optionDto: ReserveOptionDto)
        : Promise<ReserveEntity[]> {
        return await this.prismaReserve.findMany({
            where: {
                spaceId: optionDto.spaceId,
            },
            skip: (paginateDto.page - 1) * paginateDto.limit,
            take: paginateDto.limit,
            orderBy: {
                startTime: "desc",
            },
        });
    }

    async findReserveByMemberIdAndPaging(paginateDto: PaginateRequestDto, memberId: string)
        : Promise<ReserveEntity[]> {
        return await this.prismaReserve.findMany({
            where: {
                memberId: memberId,
            },
            skip: (paginateDto.page - 1) * paginateDto.limit,
            take: paginateDto.limit,
            orderBy: {
                startTime: "desc",
            },
        });
    }

    async findReserveCount(optionDto: ReserveOptionDto): Promise<number> {
        return await this.prismaReserve.count({
            where: {
                spaceId: optionDto.spaceId,
            },
        });
    }

    async findMyReserveCount(memberId: string): Promise<number> {
        return await this.prismaReserve.count({
            where: {
                memberId: memberId,
            },
        });
    }
}