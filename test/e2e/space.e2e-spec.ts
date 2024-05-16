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
    CreateSpaceRequestDto,
} from "../../src/domain/space/dto/req/create-space.request.dto";
import {
    supertestRequestFunction,
} from "../../src/util/function/supertest-request.function";
import {
    DefaultResponse,
} from "../../src/interface/response/default.response";
import {
    CreateSpaceResponseDto,
} from "../../src/domain/space/dto/res/create-space.response.dto";
import {
    MemberAuthority,
} from "../../src/types/enums/member.authority.enum";
import {
    spaceFixture,
} from "../fixture/entity/space.fixture";
import {
    generateJwtToken, 
} from "../fixture/function/jwt-token";
import {
    photoFixture, 
} from "../fixture/entity/photo.fixture";
import {
    GetPhotoListResponseDto, 
} from "../../src/domain/space/dto/res/get-photo-list-response.dto";
import {
    uuidFunction, 
} from "../../src/util/function/uuid.function";

describe("Space e2e Test", () => {
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
                    const actual = response.body as DefaultResponse<CreateSpaceResponseDto>;
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
                const actual = response.body as DefaultResponse<GetPhotoListResponseDto>;
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
                const response = await supertestRequestFunction(app.getHttpServer())
                    .get(`/spaces/${uuidFunction.v4()}/photos`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
        
    });
});