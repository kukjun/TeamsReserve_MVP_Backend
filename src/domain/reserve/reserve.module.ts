import {
    Module, 
} from "@nestjs/common";
import {
    PrismaService, 
} from "../../config/prisma/prisma.service";
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
import {
    SpaceRepository, 
} from "../space/space.repository";
import {
    MemberRepository, 
} from "../member/member.repository";

@Module({
    imports:[PrismaModule,
        MemberModule,
        SpaceModule,],
    controllers:[ReserveController,],
    providers:[PrismaService,
        ReserveService,
        ReserveRepository,
        ReserveLogRepository,
        SpaceRepository,
        MemberRepository,],
    exports:[],
})
export class ReserveModule {}