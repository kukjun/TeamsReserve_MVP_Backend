import {
    StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import {
    Test, TestingModule,
} from "@nestjs/testing";
import {
    JwtService,
} from "@nestjs/jwt";
import {
    getRedisToken,
} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {
    StartedRedisContainer,
} from "@testcontainers/redis";
import {
    HttpStatus,
    INestApplication,
    ValidationPipe,
} from "@nestjs/common";
import {
    CustomResponse,
} from "@root/interface/response/custom-response";
import {
    ConfigService,
} from "@nestjs/config";
import {
    PrismaService, 
} from "@root/config/prisma/prisma.service";
import {
    psqlTestContainerStarter, 
} from "@root/util/function/postgresql-contrainer.function";
import {
    redisTestContainerStarter, 
} from "@root/util/function/redis-container.function";
import {
    AppModule, 
} from "@root/app.module";
import {
    HttpExceptionFilter, 
} from "@root/filter/http-exception.filter";
import {
    ConfirmEmailRequest, 
} from "@auth/dto/req/confirm-email.request";
import {
    supertestRequestFunction, 
} from "@root/util/function/supertest-request.function";
import {
    ConfirmEmailResponse, 
} from "@auth/dto/res/confirm-email.response";
import {
    SignupRequest, 
} from "@auth/dto/req/signup.request";
import {
    ErrorData, 
} from "@root/interface/response/error.data";
import {
    SignupResponse, 
} from "@auth/dto/res/signup.response";
import {
    bcryptFunction, 
} from "@root/util/function/bcrypt.function";
import {
    memberFixture, 
} from "../fixture/entity/member.fixture";
import {
    SigninRequest, 
} from "@auth/dto/req/signin.request";
import {
    SigninResponse, 
} from "@auth/dto/res/signin.response";
import {
    generateRandomPasswordFunction, 
} from "@root/util/function/random-password.function";

describe("Auth e2e Test", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let redisContainer: StartedRedisContainer;
    let postgresContainer: StartedPostgreSqlContainer;
    let redisClient: Redis;
    let jwtService: JwtService;

    beforeAll(async () => {
        const psqlConfig = await psqlTestContainerStarter();
        postgresContainer = psqlConfig.container;
        prismaService = psqlConfig.service;
        redisContainer = await redisTestContainerStarter();

        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule,],
        })
            .overrideProvider(PrismaService)
            .useValue(prismaService)
            .overrideProvider(ConfigService)
            .useValue({
                get: (key: string) => {
                    if (key === "REDIS_HOST") return redisContainer.getHost();
                    if (key === "REDIS_PORT") return redisContainer.getPort();
                    if (key === "JWT_EXPIRED_TIME") return "1h";
                    if (key === "JWT_SECRET_KEY") return "teamReserveUnitTest";

                    return null;
                },
            })
            .compile();

        // 가져오는 redis module이 localhost:6400 (내가 지정한것)으로 가져옴
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

    afterEach(async () => {
        await redisClient.flushall();
        await prismaService.member.deleteMany({});
    });

    it("App이 실행되어야 한다.", () => {
        expect(app).toBeDefined();
    });

    /**
     * Email 전송은 테스트하지 않는다.
     */
    it("validateEmail Test는 하지 않는다.", () => {
    });

    /**
     * Email 인증 확인 API Test
     */
    describe("confirmEmail", () => {
        it("이메일, code가 일치하면, 사용자 email을 반환하고, 해당 email로 가입을 일정시간동안 승인한다.", async () => {
            // given
            const requestBody: ConfirmEmailRequest = {
                email: "testEmail@naver.com",
                code: "123456",
            };
            await redisClient.set("validateEmail-" + requestBody.email, requestBody.code, "EX", 360);

            // when
            const response = await supertestRequestFunction(app.getHttpServer())
                .post("/auth/confirm-email")
                .send(requestBody)
                .expect(HttpStatus.CREATED);

            // then
            const actual = response.body as CustomResponse<ConfirmEmailResponse>;
            expect(actual.data.email).toBe(requestBody.email);
            const isValid = await redisClient.get(actual.data.email);
            expect(isValid).toBe("validate");
        });

        it("이메일 또는 code가 일치하지 않으면, 일치하지 않는다는 예외를 발생시킨다.", async () => {
            // given
            const expectedPath = "/auth/confirm-email";
            const expectedStatus = HttpStatus.BAD_REQUEST;
            const expectedError = HttpStatus[expectedStatus];
            const requestBody: ConfirmEmailRequest = {
                email: "testEmail@naver.com",
                code: "123456",
            };
            await redisClient.set("validateEmail-" + requestBody.email, "123123", "EX", 360);

            // when
            const response = await supertestRequestFunction(app.getHttpServer())
                .post("/auth/confirm-email")
                .send(requestBody)
                .expect(HttpStatus.BAD_REQUEST);

            // then
            const actual = response.body as CustomResponse<ErrorData>;
            expect(actual.data.path).toBe(expectedPath);
            expect(actual.data.status).toBe(expectedStatus);
            expect(actual.data.error).toBe(expectedError);
        });
    });

    /**
     * Signup API Test
     */
    describe("signup", () => {
        describe("인증받은 이메일인 경우,", () => {
            describe("중복된 email, nickname이 아니면,", () => {
                it("회원가입을 할 수 있다.", async () => {
                    // given
                    const requestBody: SignupRequest = {
                        email: "testEmail@naver.com",
                        password: "testPassword",
                        nickname: "testName",
                        teamCode: "TEAM_CODE",
                        introduce: "testIntroduce",
                    };
                    await redisClient.set(requestBody.email, "validate", "EX", 3600);

                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .post("/auth/signup")
                        .send(requestBody)
                        .expect(HttpStatus.CREATED);

                    // then
                    const actual = response.body as CustomResponse<SignupResponse>;
                    const actualMember = await prismaService.member.findUnique({
                        where: {
                            id: actual.data.id,
                        },
                    });
                    expect(actualMember.email).toBe(requestBody.email);
                    expect(await bcryptFunction.compare(requestBody.password, actualMember.password)).toBe(true);
                    expect(actualMember.nickname).toBe(requestBody.nickname);
                    expect(actualMember.teamCode).toBe(requestBody.teamCode);
                    expect(actualMember.introduce).toBe(requestBody.introduce);
                });
                describe("TeamCode가 요구사항과 다르면,", () => {
                    it("비인증 예외를 발생시킨다. ", async () => {
                        // given
                        const expectedPath = "/auth/signup";
                        const expectedStatus = HttpStatus.UNAUTHORIZED;
                        const expectedError = HttpStatus[expectedStatus];
                        const requestBody: SignupRequest = {
                            email: "testEmail@naver.com",
                            password: "testPassword",
                            nickname: "testName",
                            teamCode: "INVALID_TEAM_CODE",
                            introduce: "testIntroduce",
                        };
                        await redisClient.set(requestBody.email, "validate", "EX", "3600");

                        // when
                        const response = await supertestRequestFunction(app.getHttpServer())
                            .post("/auth/signup")
                            .send(requestBody)
                            .expect(HttpStatus.UNAUTHORIZED);

                        // then
                        const actual = response.body as CustomResponse<ErrorData>;
                        expect(actual.data.path).toBe(expectedPath);
                        expect(actual.data.status).toBe(expectedStatus);
                        expect(actual.data.error).toBe(expectedError);
                    });
                });
            });
            describe("중복된 email, nickname 이라면,", () => {
                it("중복 예외를 발생시킨다.", async () => {
                    // given
                    const expectedPath = "/auth/signup";
                    const expectedStatus = HttpStatus.BAD_REQUEST;
                    const expectedError = HttpStatus[expectedStatus];

                    const encryptedPassword = await bcryptFunction.hash("testPassword", await bcryptFunction.genSalt());
                    const storedMember = await prismaService.member.create({
                        data: memberFixture(encryptedPassword),
                    });
                    const requestBody: SignupRequest = {
                        email: storedMember.email,
                        password: "testPassword",
                        nickname: "testName",
                        teamCode: "TEAM_CODE",
                        introduce: "testIntroduce",
                    };
                    await redisClient.set(requestBody.email, "validate", "EX", "3600");

                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .post("/auth/signup")
                        .send(requestBody)
                        .expect(HttpStatus.BAD_REQUEST);

                    // then
                    const actual = response.body as CustomResponse<ErrorData>;
                    expect(actual.data.path).toBe(expectedPath);
                    expect(actual.data.status).toBe(expectedStatus);
                    expect(actual.data.error).toBe(expectedError);

                });
            });
        });
        describe("인증받지 않은 이메일인 경우,", () => {
            it("비인증 예외를 발생시킨다.", async () => {
                // given
                const expectedPath = "/auth/signup";
                const expectedStatus = HttpStatus.UNAUTHORIZED;
                const expectedError = HttpStatus[expectedStatus];

                const requestBody: SignupRequest = {
                    email: "testEmail@naver.com",
                    password: "testPassword",
                    nickname: "testName",
                    teamCode: "TEAM_CODE",
                    introduce: "testIntroduce",
                };

                // when
                const response = await supertestRequestFunction(app.getHttpServer())
                    .post("/auth/signup")
                    .send(requestBody)
                    .expect(HttpStatus.UNAUTHORIZED);

                // then
                const actual = response.body as CustomResponse<ErrorData>;
                expect(actual.data.path).toBe(expectedPath);
                expect(actual.data.status).toBe(expectedStatus);
                expect(actual.data.error).toBe(expectedError);
            });
        });
    });

    describe("signin", () => {
        describe("id, password가 일치하면,", () => {
            it("해당 member의 정보가 담긴 jwt token을 반환한다.", async () => {
                // given
                const password = generateRandomPasswordFunction();
                const encryptedPassword = await bcryptFunction.hash(password, await bcryptFunction.genSalt());
                const storedMember = await prismaService.member.create({
                    data: memberFixture(encryptedPassword),
                });
                const requestBody: SigninRequest = {
                    email: storedMember.email,
                    password: password,
                };

                // when
                const response = await supertestRequestFunction(app.getHttpServer())
                    .post("/auth/signin")
                    .send(requestBody)
                    .expect(HttpStatus.OK);

                // then
                const actual = response.body as CustomResponse<SigninResponse>;
                const {
                    id, nickname, authority,
                } = jwtService.decode(actual.data.accessToken);
                expect(id).toBe(storedMember.id);
                expect(nickname).toBe(storedMember.nickname);
                expect(authority).toBe(storedMember.authority);
            });
        });
        describe("id, password가 일치하지 않으면,", () => {
            it("로그인 실패 예외를 발생시킨다.", async () => {
                // given
                const expectedPath = "/auth/signin";
                const expectedStatus = HttpStatus.BAD_REQUEST;
                const expectedError = HttpStatus[expectedStatus];

                const requestBody: SigninRequest = {
                    email: "testEmail@naver.com",
                    password: "testPassword",
                };

                // when
                const response = await supertestRequestFunction(app.getHttpServer())
                    .post("/auth/signin")
                    .send(requestBody)
                    .expect(HttpStatus.BAD_REQUEST);

                // then
                const actual = response.body as CustomResponse<ErrorData>;
                expect(actual.data.path).toBe(expectedPath);
                expect(actual.data.status).toBe(expectedStatus);
                expect(actual.data.error).toBe(expectedError);
            });
        });
        describe("사용자가 인가된 상태가 아니면,", () => {
            it("로그인 실패 예외를 발생시킨다.", async () => {
                // given
                const expectedPath = "/auth/signin";
                const expectedStatus = HttpStatus.BAD_REQUEST;
                const expectedError = HttpStatus[expectedStatus];

                const password = "testPassword";
                const encryptedPassword = await bcryptFunction.hash(password, await bcryptFunction.genSalt());
                const storedMember = await prismaService.member.create({
                    data: memberFixture(encryptedPassword, false),
                });
                const requestBody: SigninRequest = {
                    email: storedMember.email,
                    password: "testPassword",
                };

                // when
                const response = await supertestRequestFunction(app.getHttpServer())
                    .post("/auth/signin")
                    .send(requestBody)
                    .expect(HttpStatus.BAD_REQUEST);

                // then
                const actual = response.body as CustomResponse<ErrorData>;
                expect(actual.data.path).toBe(expectedPath);
                expect(actual.data.status).toBe(expectedStatus);
                expect(actual.data.error).toBe(expectedError);
            });
        });
    });

    /**
     * Email 전송은 테스트하지 않는다.
     */
    it("updateTempPassword Test는 하지 않는다.", () => {
    });
});