import {
    PrismaService, 
} from "../../config/prisma/prisma.service";
import {
    ReserveLogEntity, 
} from "./entity/reserve-log.entity";
import {
    Injectable, 
} from "@nestjs/common";

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
}