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
    ConfigService,
} from "@nestjs/config";
import {
    psqlTestContainerStarter,
} from "../../src/util/function/postgresql-contrainer.function";
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
    generateJwtToken,
} from "../fixture/function/jwt-token";
import {
    MemberAuthority,
} from "../../src/types/enums/member.authority.enum";
import {
    spaceFixture,
} from "../fixture/entity/space.fixture";
import {
    CreateReserveRequestDto,
} from "../../src/domain/reserve/dto/req/create-reserve.request.dto";
import {
    supertestRequestFunction,
} from "../../src/util/function/supertest-request.function";
import {
    DefaultResponse,
} from "../../src/interface/response/default.response";
import {
    CreateReserveResponseDto,
} from "../../src/domain/reserve/dto/res/create-reserve.response.dto";
import {
    reserveFixture,
} from "../fixture/entity/reserve.fixture";
import {
    uuidFunction,
} from "../../src/util/function/uuid.function";

describe("Reserve e2e Test ", () => {
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
        await prismaService.reserveLog.deleteMany({});
        await prismaService.reserve.deleteMany({});
        await prismaService.member.deleteMany({});
        await prismaService.space.deleteMany({});
    });

    it("App이 실행되어야 한다.", () => {
        expect(app).toBeDefined();
    });

    describe("createReserve", () => {
        describe("Member 있고 Space가 있으면,", () => {
            describe("동일한 시간대에 중복된 예약이 없으면", () => {
                it("예약을 하고 예약 id를 반환해야 한다.", async () => {
                    // given
                    const {
                        token, storedMember,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const storeSpace = await prismaService.space.create({
                        data: spaceFixture(),
                    });
                    const requestBody: CreateReserveRequestDto = {
                        "startTime": "2024-05-30T12:00",
                        "endTime": "2024-05-30T12:30",
                        "description": "기획팀 정기 회의를 위한 예약입니다.",
                        "spaceId": storeSpace.id,
                        "memberId": storedMember.id,
                    };
                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .post("/reserves")
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.CREATED);
                    // then
                    const actual = response.body as DefaultResponse<CreateReserveResponseDto>;
                    const actualReserve = await prismaService.reserve.findUnique({
                        where: {
                            id: actual.data.id,
                        },
                    });
                    expect(actualReserve.startTime.toISOString()).toBe(new Date(requestBody.startTime).toISOString());
                    expect(actualReserve.endTime.toISOString()).toBe(new Date(requestBody.endTime).toISOString());
                    expect(actualReserve.description).toBe(requestBody.description);
                    expect(actualReserve.spaceId).toBe(requestBody.spaceId);
                    expect(actualReserve.memberId).toBe(requestBody.memberId);
                });
            });
            describe("동일한 시간대에 중복된 예약이 있으면, ", () => {
                it("시간 중복 예외를 발생시킨다.", async () => {
                    // given
                    const {
                        token, storedMember,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const storeSpace = await prismaService.space.create({
                        data: spaceFixture(),
                    });
                    const startTimeString = "2024-05-30T12:00";
                    const endTimeString = "2024-05-30T12:30";
                    await prismaService.reserve.create({
                        data: reserveFixture(
                            storedMember.id, storeSpace.id, new Date(startTimeString), new Date(endTimeString)
                        ),
                    });

                    const requestBody: CreateReserveRequestDto = {
                        startTime: startTimeString,
                        endTime: endTimeString,
                        description: "기획팀 정기 회의를 위한 예약입니다.",
                        spaceId: storeSpace.id,
                        memberId: storedMember.id,
                    };
                    // when, then
                    await supertestRequestFunction(app.getHttpServer())
                        .post("/reserves")
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.BAD_REQUEST);
                });
            });
            describe("해당하는 공간이 없으면, ", () => {
                it("공간을 찾을 수 없다는 예외를 발생시킨다.", async () => {
                    // given
                    const {
                        token, storedMember,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const startTimeString = "2024-05-30T12:00";
                    const endTimeString = "2024-05-30T12:30";

                    const requestBody: CreateReserveRequestDto = {
                        startTime: startTimeString,
                        endTime: endTimeString,
                        description: "기획팀 정기 회의를 위한 예약입니다.",
                        spaceId: uuidFunction.v4(),
                        memberId: storedMember.id,
                    };
                    // when, then
                    await supertestRequestFunction(app.getHttpServer())
                        .post("/reserves")
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.NOT_FOUND);
                });
            });
            describe("본인의 id가 아닌 접근이라면, ", () => {
                it("자원 접근 권한 예외를 발생시킨다.", async () => {
                    // given
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const storeSpace = await prismaService.space.create({
                        data: spaceFixture(),
                    });
                    const startTimeString = "2024-05-30T12:00";
                    const endTimeString = "2024-05-30T12:30";
                    const requestBody: CreateReserveRequestDto = {
                        startTime: startTimeString,
                        endTime: endTimeString,
                        description: "기획팀 정기 회의를 위한 예약입니다.",
                        spaceId: storeSpace.id,
                        memberId: uuidFunction.v4(),
                    };
                    // when, then
                    await supertestRequestFunction(app.getHttpServer())
                        .post("/reserves")
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.FORBIDDEN);
                });
            });
        });
    });

    describe("deleteReserve", () => {
        describe("존재하는 자신의 reserve를 삭제하려고 하면,", () => {
            it("reserve를 삭제하고, null을 반환한다.", async () => {
                // given
                const {
                    token, storedMember,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                const storeSpace = await prismaService.space.create({
                    data: spaceFixture(),
                });
                const startTimeString = "2024-05-30T12:00";
                const endTimeString = "2024-05-30T12:30";
                const storeReserve = await prismaService.reserve.create({
                    data: reserveFixture(
                        storedMember.id, storeSpace.id, new Date(startTimeString), new Date(endTimeString)
                    ),
                });
                // when
                await supertestRequestFunction(app.getHttpServer())
                    .delete(`/reserves/${storeReserve.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NO_CONTENT);
                // then
                const actualReserve = await prismaService.reserve.findUnique({
                    where: {
                        id: storeReserve.id,
                    },
                });
                expect(actualReserve).toBeNull();

            });
        });
        describe("존재하지 않는 reserve를 삭제하려고 하면,", () => {
            it("reserve를 찾을 수 없다는 예외를 발생시킨다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                // when, then
                await supertestRequestFunction(app.getHttpServer())
                    .delete(`/reserves/${uuidFunction.v4()}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NOT_FOUND);

            });
        });
    });

});
