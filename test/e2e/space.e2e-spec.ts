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
    CreateSpaceRequestDto, 
} from "@space/dto/req/create-space.request.dto";
import {
    supertestRequestFunction, 
} from "@root/util/function/supertest-request.function";
import {
    CreateSpaceResponseDto, 
} from "@space/dto/res/create-space.response.dto";
import {
    spaceFixture, spaceRandomFixture, 
} from "../fixture/entity/space.fixture";
import {
    GetPhotoListResponseDto, 
} from "@space/dto/res/get-photo-list-response.dto";
import {
    uuidFunction, 
} from "@root/util/function/uuid.function";
import {
    GetSpaceResponseDto, 
} from "@space/dto/res/get-space.response.dto";
import {
    SpaceEntity, 
} from "@space/entity/space.entity";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";
import {
    PaginateData, 
} from "@root/interface/response/paginate.data";
import {
    UpdateSpaceRequestDto, 
} from "@space/dto/req/update-space.request.dto";
import {
    photoFixture, 
} from "../fixture/entity/photo.fixture";

describe("Space e2e Test", () => {
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
        await prismaService.member.deleteMany({});
        await prismaService.photo.deleteMany({});
        await prismaService.space.deleteMany({});
    });

    it("App이 실행되어야 한다.", () => {
        expect(app).toBeDefined();
    });

    describe("createSpace", () => {
        describe("ADMIN, MANAGER의 권한이라면, ", () => {
            describe("Space Name이 중복이 아니라면, ", () => {
                it("Space를 생성하고 생성된 Space의 Id를 반환해야 한다.", async () => {
                    // given
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const requestBody: CreateSpaceRequestDto = {
                        name: "미래 인재관",
                        location: "서울시 용산구 한남대로 412-1",
                        description: "40명을 수용할 수 있는 다용도 실입니다.",
                    };

                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .post("/spaces")
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.CREATED);

                    // then
                    const actual = response.body as CustomResponse<CreateSpaceResponseDto>;
                    const actualSpace = await prismaService.space.findUnique({
                        where: {
                            id: actual.data.id,
                        },
                    });
                    expect(actualSpace.name).toBe(requestBody.name);
                    expect(actualSpace.location).toBe(requestBody.location);
                    expect(actualSpace.description).toBe(requestBody.description);
                });
            });
            describe("Space Name이 중복이라면, ", () => {
                it("Space가 중복되었다는 예외가 발생한다.", async () => {
                    // given
                    const storedSpace = await prismaService.space.create({
                        data: spaceFixture(),
                    });
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const requestBody: CreateSpaceRequestDto = {
                        name: storedSpace.name,
                        location: "서울시 용산구 한남대로 412-1",
                        description: "40명을 수용할 수 있는 다용도 실입니다.",
                    };

                    // when
                    await supertestRequestFunction(app.getHttpServer())
                        .post("/spaces")
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.BAD_REQUEST);
                });
            });
        });
        describe("ADMIN, MANAGER의 권한이 아니라면, ", () => {
            it("권한 부족 예외가 발생한다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                const requestBody: CreateSpaceRequestDto = {
                    name: "미래 인재관",
                    location: "서울시 용산구 한남대로 412-1",
                    description: "40명을 수용할 수 있는 다용도 실입니다.",
                };

                // when
                await supertestRequestFunction(app.getHttpServer())
                    .post("/spaces")
                    .send(requestBody)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.FORBIDDEN);
            });
        });
    });

    describe("getPhotoList", () => {
        describe("공간이 존재하면, ", () => {
            it("해당 공간에 저장된 사진을 조회할 수 있다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                const storedSpace = await prismaService.space.create({
                    data: spaceFixture(),
                });
                const storedPhoto = await prismaService.photo.create({
                    data: photoFixture(storedSpace.id),
                });

                // when
                const response = await supertestRequestFunction(app.getHttpServer())
                    .get(`/spaces/${storedSpace.id}/photos`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.OK);

                // then
                const actual = response.body as CustomResponse<GetPhotoListResponseDto>;
                const actualPhoto = await prismaService.photo.findUnique({
                    where: {
                        id: actual.data.data[0].id,
                    },
                });

                expect(actualPhoto.id).toBe(storedPhoto.id);
                expect(actualPhoto.path).toBe(storedPhoto.path);
                expect(actualPhoto.name).toBe(storedPhoto.name);
            });
        });
        describe("공간이 존재하지 않으면, ", () => {
            it("공간을 찾을 수 없다는 예외를 발생시킨다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                // when
                await supertestRequestFunction(app.getHttpServer())
                    .get(`/spaces/${uuidFunction.v4()}/photos`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
    });
    describe("getSpace", () => {
        describe("공간이 존재하면,", () => {
            it("공간을 조회할 수 있다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                const storedSpace = await prismaService.space.create({
                    data: spaceFixture(),
                });

                // when
                const response = await supertestRequestFunction(app.getHttpServer())
                    .get(`/spaces/${storedSpace.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.OK);

                // then
                const actual = response.body as CustomResponse<GetSpaceResponseDto>;
                expect(actual.data.id).toBe(storedSpace.id);
                expect(actual.data.name).toBe(storedSpace.name);
                expect(actual.data.location).toBe(storedSpace.location);
                expect(actual.data.description).toBe(storedSpace.description);
            });
        });
        describe("공간이 존재하지 않으면, ", () => {
            it("공간을 찾을 수 없다는 예외를 발생시킨다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                // when
                await supertestRequestFunction(app.getHttpServer())
                    .get(`/spaces/${uuidFunction.v4()}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
    });
    describe("getSpaceList", () => {
        it("존재하는 SpaceList 정보를 보여줘야 한다.", async () => {
            // given
            const {
                token,
            } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);

            const randomNumber = Math.ceil(Math.random() * 20);
            const storedSpaces: SpaceEntity[] = [];
            for (let i = 0; i < randomNumber; i++) {
                storedSpaces.push(spaceRandomFixture(i));
            }
            await prismaService.space.createMany({
                data: storedSpaces,
            });
            const request: PaginateRequestDto = {
                page: 1,
                limit: 10,
            };

            // when
            const response = await supertestRequestFunction(app.getHttpServer())
                .get("/spaces")
                .query(request)
                .set("Authorization", `Bearer ${token}`)
                .expect(HttpStatus.OK);

            // then
            const actual = response.body as CustomResponse<PaginateData<GetSpaceResponseDto>>;
            expect(actual.data.meta.totalCount).toBe(randomNumber);
            expect(actual.data.meta.totalPage).toEqual(Math.ceil(randomNumber / request.limit));
            expect(actual.data.meta.page).toBe(request.page);
            expect(actual.data.meta.take).toBe(request.limit);
            expect(actual.data.meta.hasNextPage).toEqual(request.page < Math.ceil((randomNumber) / request.limit));
        });
    });
    describe("updateSpace", () => {
        describe("존재하는 공간을 변경하려고 하면,", () => {
            describe("dto의 name에 중복이 없으면", () => {
                it("변경하고자 하는 내용으로 공간 정보가 변경된다.", async () => {
                    // given
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                    const storedSpace = await prismaService.space.create({
                        data: spaceFixture(),
                    });
                    const updatedDto: UpdateSpaceRequestDto = {
                        name: "updatedName",
                    };

                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .put(`/spaces/${storedSpace.id}`)
                        .send(updatedDto)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.CREATED);

                    // then
                    const actual = response.body as CustomResponse<CreateSpaceResponseDto>;
                    const actualSpace = await prismaService.space.findUnique({
                        where: {
                            id: actual.data.id,
                        },
                    });
                    expect(actualSpace.name).toBe(updatedDto.name);
                    expect(actualSpace.location).toBe(storedSpace.location);
                    expect(actualSpace.description).toBe(storedSpace.description);
                });
            });
            describe("dto의 name에 해당하는 공간이 이미 있으면, ", () => {
                it("공간 이름에 중복이 발생했다는 예외를 발생시킨다.", async () => {
                    // given
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                    const storedSpace = await prismaService.space.create({
                        data: spaceFixture(),
                    });
                    const updatedDto: UpdateSpaceRequestDto = {
                        name: storedSpace.name,
                    };

                    // when
                    await supertestRequestFunction(app.getHttpServer())
                        .put(`/spaces/${storedSpace.id}`)
                        .send(updatedDto)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.BAD_REQUEST);

                });

            });
        });
        describe("존재하지 않는 공간을 변경하려고 하면,", () => {
            it("공간이 존재하지 않는다는 예외를 발생시킨다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                const requestId= uuidFunction.v4();
                const updatedDto: UpdateSpaceRequestDto = {
                    name: "updatedName",
                };

                // when
                await supertestRequestFunction(app.getHttpServer())
                    .put(`/spaces/${requestId}`)
                    .send(updatedDto)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
    });

    describe("deleteSpace", () => {
        describe("만약 공간이 존재한다면,", () => {
            describe("만약 공간에 사진이 존재한다면, ", () => {
                it("공간을 삭제하고 null을 반환한다.", async () => {
                    // given
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const storedSpace = await prismaService.space.create({
                        data: spaceFixture(),
                    });
                    await prismaService.photo.create({
                        data: photoFixture(storedSpace.id),
                    });
                    // when
                    await supertestRequestFunction(app.getHttpServer())
                        .delete(`/spaces/${storedSpace.id}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.NO_CONTENT);

                    // then
                    const actualSpace = await prismaService.space.findUnique({
                        where: {
                            id: storedSpace.id,
                        },
                    });
                    expect(actualSpace).toBeNull();
                    const actualPhotos = await prismaService.photo.findMany({
                        where: {
                            spaceId: storedSpace.id,
                        },
                    });
                    expect(actualPhotos.length).toBe(0);
                });
            });
            describe("만약 공간에 사진이 존재하지 않으면, ", () => {
                it("공간을 삭제하고 null을 반환한다.", async () => {
                    // given
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const storedSpace = await prismaService.space.create({
                        data: spaceFixture(),
                    });
                    // when
                    await supertestRequestFunction(app.getHttpServer())
                        .delete(`/spaces/${storedSpace.id}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.NO_CONTENT);

                    // then
                    const actualSpace = await prismaService.space.findUnique({
                        where: {
                            id: storedSpace.id,
                        },
                    });
                    expect(actualSpace).toBeNull();
                });
            });

        });
        describe("만약 공간이 존재하지 않는다면,", () => {
            it("공간이 존재하지 않는다는 예외를 발생시킨다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                const requestId = uuidFunction.v4();
                // when, then
                await supertestRequestFunction(app.getHttpServer())
                    .delete(`/spaces/${requestId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
        
    });
});