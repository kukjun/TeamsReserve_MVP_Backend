import {
    HttpStatus,
    INestApplication, ValidationPipe,
} from "@nestjs/common";
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
    Test, TestingModule,
} from "@nestjs/testing";
import {
    CustomResponse,
} from "@root/interface/response/custom-response";
import {
    StartedRedisContainer, 
} from "@testcontainers/redis";
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
    generateJwtToken, 
} from "../fixture/function/jwt-token";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";
import {
    spaceFixture, 
} from "../fixture/entity/space.fixture";
import {
    CreateReserveRequestDto, 
} from "@reserve/dto/req/create-reserve.request.dto";
import {
    supertestRequestFunction, 
} from "@root/util/function/supertest-request.function";
import {
    CreateReserveResponseDto, 
} from "@reserve/dto/res/create-reserve.response.dto";
import {
    reserveFixture, 
} from "../fixture/entity/reserve.fixture";
import {
    uuidFunction, 
} from "@root/util/function/uuid.function";
import {
    GetReserveResponseDto, 
} from "@reserve/dto/res/get-reserve.response.dto";
import {
    ReserveEntity, 
} from "@reserve/entity/reserve.entity";
import {
    PaginateData, 
} from "@root/interface/response/paginate.data";
import {
    ReserveLogEntity, 
} from "@reserve/entity/reserve-log.entity";
import {
    reserveLogFixture, 
} from "../fixture/entity/reserve-log.fixture";
import {
    GetReserveLogResponseDto, 
} from "@reserve/dto/res/get-reserve-log.response.dto";

describe("Reserve e2e Test ", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let postgresContainer: StartedPostgreSqlContainer;
    let redisContainer: StartedRedisContainer;
    let jwtService: JwtService;
    let configService: ConfigService;

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
        await redisContainer.stop();
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
                    const actual = response.body as CustomResponse<CreateReserveResponseDto>;
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

    describe("getReserve", () => {
        describe("존재하는 reserve를 조회하면,", () => {
            it("reserve의 값들을 보여준다.", async () => {
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
                const response = await supertestRequestFunction(app.getHttpServer())
                    .get(`/reserves/${storeReserve.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.OK);
                // then
                const actual = response.body as CustomResponse<GetReserveResponseDto>;
                expect(actual.data.id).toBe(storeReserve.id);
                expect(actual.data.startTime).toBe(storeReserve.startTime.toISOString());
                expect(actual.data.endTime).toBe(storeReserve.endTime.toISOString());
                expect(actual.data.description).toBe(storeReserve.description);

            });
        });
        describe("존재하지 않는 reserve를 조회하려고 하면,", () => {
            it("reserve를 찾을 수 없다는 예외를 발생시킨다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                // when, then
                await supertestRequestFunction(app.getHttpServer())
                    .get(`/reserves/${uuidFunction.v4()}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
    });

    describe("getReserveList", () => {
        it("존재하는 ReserveList 정보를 보여줘야 한다.", async () => {
            // given
            const {
                token, storedMember,
            } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
            const storeSpace = await prismaService.space.create({
                data: spaceFixture(),
            });
            const randomNumber = Math.ceil(Math.random() * 15);
            const storeReserves: ReserveEntity[] = [];
            for(let i =0; i< randomNumber; i++) {
                storeReserves.push(reserveFixture(
                    storedMember.id,
                    storeSpace.id,
                    new Date(`2024-05-${i+10}T12:00`),
                    new Date(`2024-05-${i+11}T12:00`),
                    `e2e random value = ${i}`
                ));
            }
            await prismaService.reserve.createMany({
                data: storeReserves,
            });
            const request= {
                page: 1,
                limit: 10,
                spaceId: storeSpace.id,
            };

            // when
            const response = await supertestRequestFunction(app.getHttpServer())
                .get("/reserves")
                .query(request)
                .set("Authorization", `Bearer ${token}`)
                .expect(HttpStatus.OK);
            // then
            const actual = response.body as CustomResponse<PaginateData<GetReserveResponseDto>>;
            expect(actual.data.meta.totalCount).toBe(randomNumber);
            expect(actual.data.meta.totalPage).toEqual(Math.ceil(randomNumber / request.limit));
            expect(actual.data.meta.page).toBe(request.page);
            expect(actual.data.meta.take).toBe(request.limit);
            expect(actual.data.meta.hasNextPage).toEqual(request.page < Math.ceil((randomNumber) / request.limit));
        });
    });

    describe("getMyReserveList", () => {
        it("본인이 예약한 ReserveList를 보여줄 수 있어야 한다.", async () => {
            // given
            const {
                token, storedMember,
            } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
            const storeSpace = await prismaService.space.create({
                data: spaceFixture(),
            });
            const randomNumber = Math.ceil(Math.random() * 15);
            const storeReserves: ReserveEntity[] = [];
            for(let i =0; i< randomNumber; i++) {
                storeReserves.push(reserveFixture(
                    storedMember.id,
                    storeSpace.id,
                    new Date(`2024-05-${i+10}T12:00`),
                    new Date(`2024-05-${i+11}T12:00`),
                    `e2e random value = ${i}`
                ));
            }
            await prismaService.reserve.createMany({
                data: storeReserves,
            });
            const request= {
                page: 1,
                limit: 10,
            };

            // when
            const response = await supertestRequestFunction(app.getHttpServer())
                .get("/reserves/my-reserve")
                .query(request)
                .set("Authorization", `Bearer ${token}`)
                .expect(HttpStatus.OK);
            // then
            const actual = response.body as CustomResponse<PaginateData<GetReserveResponseDto>>;
            expect(actual.data.meta.totalCount).toBe(randomNumber);
            expect(actual.data.meta.totalPage).toEqual(Math.ceil(randomNumber / request.limit));
            expect(actual.data.meta.page).toBe(request.page);
            expect(actual.data.meta.take).toBe(request.limit);
            expect(actual.data.meta.hasNextPage).toEqual(request.page < Math.ceil((randomNumber) / request.limit));
        });
    });

    describe("getMyReserveList", () => {
        it("모든 Reserve Log를 Paginate된 결과로 볼 수 있다.", async () => {
            // given
            const {
                token,
            } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
            const randomNumber = Math.ceil(Math.random() * 15);
            const storeReserveLogs: ReserveLogEntity[] = [];
            for(let i =0; i< randomNumber; i++) {
                storeReserveLogs.push(reserveLogFixture(i));
            }
            await prismaService.reserveLog.createMany({
                data: storeReserveLogs,
            });
            const request= {
                page: 1,
                limit: 10,
            };

            // when
            const response = await supertestRequestFunction(app.getHttpServer())
                .get("/reserves/logs")
                .query(request)
                .set("Authorization", `Bearer ${token}`)
                .expect(HttpStatus.OK);
            // then
            const actual = response.body as CustomResponse<PaginateData<GetReserveLogResponseDto>>;
            expect(actual.data.meta.totalCount).toBe(randomNumber);
            expect(actual.data.meta.totalPage).toEqual(Math.ceil(randomNumber / request.limit));
            expect(actual.data.meta.page).toBe(request.page);
            expect(actual.data.meta.take).toBe(request.limit);
            expect(actual.data.meta.hasNextPage).toEqual(request.page < Math.ceil((randomNumber) / request.limit));
        });
    });

})
;
