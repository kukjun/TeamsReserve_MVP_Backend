import {
    Injectable,
} from "@nestjs/common";
import {
    PrismaService,
} from "../../config/prisma/prisma.service";
import {
    ReserveEntity,
} from "./entity/reserve.entity";

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
}