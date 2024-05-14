import {
    HttpStatus,
    INestApplication, ValidationPipe,
} from "@nestjs/common";
import {
    PrismaService,
} from "../../src/config/prisma/prisma.service";
import {
    StartedPostgreSqlContainer,
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
    memberFixture, memberRandomFixture,
} from "../fixture/entity/member.fixture";
import {
    generateRandomPasswordFunction,
} from "../../src/util/function/random-password.function";
import {
    MemberToken,
} from "../../src/interface/member-token";
import {
    DefaultResponse,
} from "../../src/interface/response/default.response";
import {
    GetMemberResponseDto,
} from "../../src/domain/member/dto/res/get-member.response.dto";
import {
    ConfigService,
} from "@nestjs/config";
import {
    ErrorData,
} from "../../src/interface/response/error.data";
import {
    bcryptFunction,
} from "../../src/util/function/bcrypt.function";
import {
    uuidFunction,
} from "../../src/util/function/uuid.function";
import {
    supertestRequestFunction,
} from "../../src/util/function/supertest-request.function";
import {
    psqlTestContainerStarter,
} from "../../src/util/function/postgresql-contrainer.function";
import {
    MemberEntity,
} from "../../src/domain/member/entity/member.entity";
import {
    PaginateRequestDto,
} from "../../src/interface/request/paginate.request.dto";
import {
    PaginateData,
} from "../../src/interface/response/paginate.data";

describe("Member e2e Test", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let postgresContainer: StartedPostgreSqlContainer;
    let jwtService: JwtService;
    let configService: ConfigService;

    beforeAll(async () => {
        const psqlConfig = await psqlTestContainerStarter();
        postgresContainer = psqlConfig.container;
        prismaService = psqlConfig.service;

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

    /**
     * Get Member Test - 여기서, JWT Token Test를 포함했으므로, 다른 곳에서 JWT Token과 관련된 Test는 진행하지 않음
     */
    describe("getMember(JWT Token Test)", () => {
        describe("인가된 JWT Token을 가지면,", () => {
            describe("해당하는 사용자 id가 있으면, ", () => {
                it("사용자 정보를 반환해야 한다.", async () => {
                    // given
                    const randomPassword = generateRandomPasswordFunction();
                    const encryptedPassword = await bcryptFunction.hash(randomPassword, await bcryptFunction.genSalt());
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
                    const response = await supertestRequestFunction(app.getHttpServer())
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
                    const randomPassword = generateRandomPasswordFunction();
                    const encryptedPassword = await bcryptFunction.hash(randomPassword, await bcryptFunction.genSalt());
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

                    const failId = uuidFunction.v4();
                    const expectedPath = `/members/${failId}`;
                    const expectedStatus = HttpStatus.NOT_FOUND;
                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
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
                    test: "payload",
                }, {
                    secret: "INVALID_TOKEN",
                });

                const failId = uuidFunction.v4();
                // when
                await supertestRequestFunction(app.getHttpServer())
                    .get(`/members/${failId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });
        describe("JWT Token이 없으면,", () => {
            it("JWT 인증이 실패했다는 예외가 발생한다.", async () => {
                const failId = uuidFunction.v4();
                // when
                await supertestRequestFunction(app.getHttpServer())
                    .get(`/members/${failId}`)
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });
    });

    describe("getMemberList", () => {
        it("존재하는 MemberList 정보를 보여줘야 한다.", async () => {
            // given
            const randomPassword = generateRandomPasswordFunction();
            const encryptedPassword = await bcryptFunction.hash(randomPassword, await bcryptFunction.genSalt());
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
            const randomNumber = Math.ceil(Math.random() * 20);
            const storedMembers: MemberEntity[] = [];
            for (let i = 0; i < randomNumber; i++) {
                storedMembers.push(memberRandomFixture(
                    await bcryptFunction.hash(generateRandomPasswordFunction(), await bcryptFunction.genSalt()),
                    true,
                    i
                ));
            }
            await prismaService.member.createMany({
                data: storedMembers,
            });
            const request: PaginateRequestDto = {
                page: 1,
                limit: 10,
            };

            // when
            const response = await supertestRequestFunction(app.getHttpServer())
                .get("/members")
                .query(request)
                .set("Authorization", `Bearer ${token}`)
                .expect(HttpStatus.OK);

            // then
            const actual = response.body as DefaultResponse<PaginateData<GetMemberResponseDto>>;
            expect(actual.data.meta.totalCount).toBe(randomNumber + 1);
            expect(actual.data.meta.totalPage).toEqual(Math.ceil((randomNumber + 1) / request.limit));
            expect(actual.data.meta.page).toBe(request.page);
            expect(actual.data.meta.take).toBe(request.limit);
            expect(actual.data.meta.hasNextPage).toEqual(request.page < Math.ceil((randomNumber + 1) / request.limit));
        });
    });
});