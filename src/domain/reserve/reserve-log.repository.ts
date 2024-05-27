import {
    Injectable, 
} from "@nestjs/common";
import {
    PrismaService, 
} from "@root/config/prisma/prisma.service";
import {
    ReserveLogEntity, 
} from "@reserve/entity/reserve-log.entity";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";

@Injectable()
export class ReserveLogRepository {
    private readonly prismaReserveLog: PrismaService["reserveLog"];
    constructor(private readonly prismaService: PrismaService) {
        this.prismaReserveLog = prismaService.reserveLog;
    }

    async saveReserveLog(
        reserveLog: ReserveLogEntity,
        txReserveLog?: PrismaService["reserveLog"]
    ): Promise<string> {
        const prismaReserveLogClient = txReserveLog ?? this.prismaReserveLog;
        const log = await prismaReserveLogClient.create({
            data: reserveLog,
        });

        return log.id;
    }

    async findReserveLogsByPaging(paginateDto: PaginateRequestDto): Promise<ReserveLogEntity[]> {
        return await this.prismaReserveLog.findMany({
            skip: (paginateDto.page - 1) * paginateDto.limit,
            take: paginateDto.limit,
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findReserveLogsCount():Promise<number> {
        return await this.prismaReserveLog.count();
    }
}