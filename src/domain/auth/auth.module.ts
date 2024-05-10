import {
    Module, 
} from "@nestjs/common";
import {
    AuthController, 
} from "./auth.controller";
import {
    AuthService, 
} from "./auth.service";
import {
    EmailTransferService, 
} from "./email-transfer.service";
import {
    MemberModule, 
} from "../member/member.module";
import {
    MemberRepository, 
} from "../member/repository/member.repository";
import {
    PrismaService, 
} from "../../config/prisma/prisma.service";
import {
    ConfigModule, ConfigService, 
} from "@nestjs/config";
import {
    JwtModule, 
} from "@nestjs/jwt";
import {
    LocalStrategy, 
} from "./strategies/local.strategy";
import {
    JwtStrategy, 
} from "./strategies/jwt.strategy";

@Module({
    imports: [
        MemberModule,
        JwtModule.registerAsync({
            imports: [ConfigModule,],
            inject: [ConfigService,],
            useFactory: (configService: ConfigService) => {
                return {
                    signOptions: {
                        expiresIn: configService.get<string>("JWT_EXPIRED_TIME") ?? "1h",
                    },
                };
            },
        }),
    ],
    controllers: [AuthController,],
    providers: [
        AuthService,
        EmailTransferService,
        MemberRepository,
        PrismaService,
        LocalStrategy,
        JwtStrategy,
    ],
    exports: [],
})
export class AuthModule {}