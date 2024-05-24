import {
    PrismaService,
} from "./prisma.service";
import {
    Module, 
} from "@nestjs/common";

@Module({
    providers: [{
        provide: PrismaService,
        useFactory: () => new PrismaService(),
        inject: [],
    },],
    exports: [PrismaService,],
})
export class PrismaModule {}