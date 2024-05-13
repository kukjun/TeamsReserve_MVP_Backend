import * as request from "supertest";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import {
    promisify,
} from "util";
import {
    exec,
} from "child_process";
import {
    HttpStatus,
    INestApplication, ValidationPipe,
} from "@nestjs/common";
import {
    PrismaService,
} from "../../src/config/prisma/prisma.service";
import {
    PostgreSqlContainer, StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import {
    JwtService,
} from "@nestjs/jwt";
import {
    Test, TestingModule,
} from "@nestjs/testing";
import {
    AppModule,
} from "../../src/app.module";
import {
    HttpExceptionFilter,
} from "../../src/filter/http-exception.filter";
import {
    memberFixture,
} from "../fixture/entity/member.fixture";
import {
    generateRandomPassword,
} from "../../src/util/function/random-password";
import {
    MemberToken,
} from "../../src/interface/member-token";
import {
    DefaultResponse, 
} from "../../src/response/default.response";
import {
    GetMemberResponseDto, 
} from "../../src/domain/member/dto/res/get-member.response.dto";
import {
    ConfigService, 
} from "@nestjs/config";
import {
    ErrorData, 
} from "../../src/response/error.data";

const execAsync = promisify(exec);

describe("Member e2e Test", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let postgresContainer: StartedPostgreSqlContainer;
    let jwtService: JwtService;
    let configService: ConfigService;

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

        // 테스트를 시작할 때, Test Container를 사용하는 PrismaService를 주입받음
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule,],
        })
            .overrideProvider(PrismaService)
            .useValue(prismaService)
            .compile();

        jwtService = module.get<JwtService>(JwtService);
        configService = module.get<ConfigService>(ConfigService);
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
        }));
        app.useGlobalFilters(new HttpExceptionFilter());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await postgresContainer.stop();
    });

    afterEach(async () => {
        await prismaService.member.deleteMany({});
    });

    it("App이 실행되어야 한다.", () => {
        expect(app).toBeDefined();
    });

    describe("getMember", () => {
        describe("인가된 JWT Token을 가지면,", () => {
            describe("해당하는 사용자 id가 있으면, ", () => {
                it("사용자 정보를 반환해야 한다.", async () => {
                    // given
                    const randomPassword = generateRandomPassword();
                    const encryptedPassword = await bcrypt.hash(randomPassword, await bcrypt.genSalt());
                    const member = memberFixture(encryptedPassword, true);
                    const storedMember = await prismaService.member.create({
                        data: member,
                    });
                    const payload: MemberToken = {
                        id: storedMember.id,
                        nickname: storedMember.nickname,
                        authority: storedMember.authority,
                    };
                    const token = jwtService.sign(payload, {
                        secret: configService.get<string>("JWT_SECRET_KEY"),
                    });
                    // when
                    const response = await request(app.getHttpServer())
                        .get(`/members/${storedMember.id}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.OK);
                    // then
                    const actual = response.body as DefaultResponse<GetMemberResponseDto>;
                    expect(actual.data.id).toBe(storedMember.id);
                    expect(actual.data.nickname).toBe(storedMember.nickname);
                    expect(actual.data.email).toBe(storedMember.email);
                    expect(actual.data.teamCode).toBe(storedMember.teamCode);
                    expect(actual.data.introduce).toBe(storedMember.introduce);
                });
            });

            describe("해당하는 사용자가 없으면, ", () => {
                it("사용자 정보를 찾을 수 없다는 예외를 발생시킨다.", async () => {
                    // given
                    const randomPassword = generateRandomPassword();
                    const encryptedPassword = await bcrypt.hash(randomPassword, await bcrypt.genSalt());
                    const member = memberFixture(encryptedPassword, true);
                    const storedMember = await prismaService.member.create({
                        data: member,
                    });
                    const payload: MemberToken = {
                        id: storedMember.id,
                        nickname: storedMember.nickname,
                        authority: storedMember.authority,
                    };
                    const token = jwtService.sign(payload, {
                        secret: configService.get<string>("JWT_SECRET_KEY"),
                    });

                    const failId = uuid.v4();
                    const expectedPath = `/members/${failId}`;
                    const expectedStatus = HttpStatus.NOT_FOUND;
                    // when
                    const response = await request(app.getHttpServer())
                        .get(`/members/${failId}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.NOT_FOUND);
                    // then
                    const actual = response.body as DefaultResponse<ErrorData>;
                    expect(actual.data.path).toBe(expectedPath);
                    expect(actual.data.status).toBe(expectedStatus);
                    expect(actual.data.error).toBe(HttpStatus[expectedStatus]);
                });
            });
        });
        describe("인가되지 않는 JWT Token을 가지면,", () => {
            it("JWT 인증이 실패했다는 예외가 발생한다.", async () => {
                const token = jwtService.sign({
                    test:"payload",
                }, {
                    secret: "INVALID_TOKEN",
                });

                const failId = uuid.v4();
                // when
                await request(app.getHttpServer())
                    .get(`/members/${failId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });
        describe("JWT Token이 없으면,", () => {
            it("JWT 인증이 실패했다는 예외가 발생한다.", async () => {
                const failId = uuid.v4();
                // when
                await request(app.getHttpServer())
                    .get(`/members/${failId}`)
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });
    });
});