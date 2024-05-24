import {
    Module, 
} from "@nestjs/common";
import {
    MemberRepository, 
} from "./member.repository";
import {
    PrismaModule, 
} from "../../config/prisma/prisma.module";
import {
    MemberService, 
} from "./member.service";
import {
    MemberController, 
} from "./member.controller";

@Module({
    imports: [PrismaModule,],
    controllers: [
        MemberController,
    ],
    providers: [
        MemberRepository,
        MemberService,
    ],
    exports: [MemberRepository,],
})
export class MemberModule {}