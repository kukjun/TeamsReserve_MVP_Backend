import {
    exec,
} from "child_process";
import {
    promisify,
} from "util";
import {
    PostgreSqlContainer, StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import {
    PrismaService, 
} from "../../src/config/prisma/prisma.service";
import {
    Test, TestingModule, 
} from "@nestjs/testing";
import {
    AppModule, 
} from "../../src/app.module";
import {
    JwtService, 
} from "@nestjs/jwt";
import {
    getRedisToken,
    RedisModule,
} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {
    RedisContainer, StartedRedisContainer,
} from "@testcontainers/redis";
import {
    HttpExceptionFilter, 
} from "../../src/filter/http-exception.filter";
import {
    INestApplication,
    ValidationPipe,
} from "@nestjs/common";

const execAsync = promisify(exec);

describe("Auth e2e Test", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let redisContainer: StartedRedisContainer;
    let postgresContainer: StartedPostgreSqlContainer;
    let redisClient: Redis;
    let jwtService: JwtService;

    beforeAll(async () => {
        // Pg Test Container 시작
        postgresContainer = await new PostgreSqlContainer().start();
        const config = {
            host: postgresContainer.getHost(),
            port: postgresContainer.getMappedPort(5432),
            database: postgresContainer.getDatabase(),
            user: postgresContainer.getUsername(),
            password: postgresContainer.getPassword(),
        };

        // Container 가 가지는 db 주소를 반환
        const databaseUrl = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

        // 스크립트 실행을 통해 DB Container에 우리가 지정한 prisma model로 migrate 진행
        await execAsync(
            `DATABASE_URL=${databaseUrl} npx prisma migrate deploy --preview-feature`
        );

        // DB Container와 연결되는 Prisma Service를 반환
        prismaService = new PrismaService({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
        });

        redisContainer = await new RedisContainer().start();

        // 테스트를 시작할 때, Test Container를 사용하는 PrismaService를 주입받음
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule,],
        })
            .overrideProvider(PrismaService)
            .useValue(prismaService)
            .overrideModule(RedisModule)
            .useModule(RedisModule.forRoot({
                readyLog: true,
                config: {
                    host: redisContainer.getHost(),
                    port: redisContainer.getPort(),
                },
            }))
            .compile();

        redisClient = module.get<Redis>(getRedisToken("default"));
        jwtService = module.get<JwtService>(JwtService);
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
        }));
        app.useGlobalFilters(new HttpExceptionFilter());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await redisContainer.stop();
        await postgresContainer.stop();
    });

    it("App이 실행되어야 한다.", () => {
        expect(app).toBeDefined();
    });
});