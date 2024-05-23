import {
    Module, 
} from "@nestjs/common";
import {
    PrismaModule, 
} from "../../config/prisma/prisma.module";
import {
    ReserveController, 
} from "./reserve.controller";
import {
    ReserveService, 
} from "./reserve.service";
import {
    ReserveRepository, 
} from "./reserve.repository";
import {
    ReserveLogRepository, 
} from "./reserve-log.repository";
import {
    MemberModule, 
} from "../member/member.module";
import {
    SpaceModule, 
} from "../space/space.module";

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