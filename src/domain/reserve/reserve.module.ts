import {
    Module, 
} from "@nestjs/common";
import {
    PrismaModule, 
} from "@root/config/prisma/prisma.module";
import {
    MemberModule, 
} from "@member/member.module";
import {
    SpaceModule, 
} from "@space/space.module";
import {
    ReserveController, 
} from "@reserve/reserve.controller";
import {
    ReserveService, 
} from "@reserve/reserve.service";
import {
    ReserveRepository, 
} from "@reserve/reserve.repository";
import {
    ReserveLogRepository, 
} from "@reserve/reserve-log.repository";

@Module({
    imports:[PrismaModule,
        MemberModule,
        SpaceModule,],
    controllers:[ReserveController,],
    providers:[
        ReserveService,
        ReserveRepository,
        ReserveLogRepository,],
    exports:[],
})
export class ReserveModule {}