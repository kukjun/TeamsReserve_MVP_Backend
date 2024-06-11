import {
    Module, 
} from "@nestjs/common";
import {
    ConfigModule, ConfigService, 
} from "@nestjs/config";
import {
    JwtModule, 
} from "@nestjs/jwt";
import {
    PassportModule, 
} from "@nestjs/passport";
import {
    PrismaModule, 
} from "@root/config/prisma/prisma.module";
import {
    MemberModule, 
} from "@member/member.module";
import {
    AuthController, 
} from "@auth/auth.controller";
import {
    AuthService, 
} from "@auth/auth.service";
import {
    EmailTransferService, 
} from "@auth/email-transfer.service";
import {
    LocalStrategy, 
} from "@auth/strategies/local.strategy";
import {
    JwtStrategy, 
} from "@auth/strategies/jwt.strategy";

@Module({
    imports: [
        PrismaModule,
        MemberModule,
        PassportModule,
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
        LocalStrategy,
        JwtStrategy,
    ],
    exports: [],
})
export class AuthModule {}