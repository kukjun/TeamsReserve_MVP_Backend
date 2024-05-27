import {
    Module, 
} from "@nestjs/common";
import {
    PrismaModule, 
} from "@root/config/prisma/prisma.module";
import {
    MemberController, 
} from "@member/member.controller";
import {
    MemberRepository, 
} from "@member/member.repository";
import {
    MemberService, 
} from "@member/member.service";

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