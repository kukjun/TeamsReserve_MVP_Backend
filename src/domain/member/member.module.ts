import {
    Module, 
} from "@nestjs/common";
import {
    MemberRepository, 
} from "./repository/member.repository";
import {
    PrismaService, 
} from "../../config/prisma/prisma.service";
import {
    PrismaModule, 
} from "../../config/prisma/prisma.module";

@Module({
    imports: [PrismaModule,],
    providers: [
        PrismaService,
        MemberRepository,
    ],
    exports: [MemberRepository,],
})
export class MemberModule {}