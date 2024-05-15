import {
    Module,
} from "@nestjs/common";
import {
    AuthModule,
} from "./domain/auth/auth.module";
import {
    ConfigModule, ConfigService,
} from "@nestjs/config";
import {
    RedisModule,
} from "@liaoliaots/nestjs-redis";
import {
    PrismaModule, 
} from "./config/prisma/prisma.module";
import {
    MemberModule, 
} from "./domain/member/member.module";
import {
    SpaceModule, 
} from "./domain/space/space.module";

@Module({
    imports: [
        AuthModule,
        PrismaModule,
        MemberModule,
        SpaceModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
        }),
        RedisModule.forRootAsync( // 동적으로 모듈을 구성하겠다. = 설정파일을 기반으로 설정하기 위함.
            {
                imports: [ConfigModule,],
                inject: [ConfigService,],
                useFactory: (configService: ConfigService) => ({
                    readyLog: true,
                    config: {
                        port: configService.get<number>("REDIS_PORT"),
                        host: configService.get<string>("REDIS_HOST"),
                    },
                }),
            }
        ),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
