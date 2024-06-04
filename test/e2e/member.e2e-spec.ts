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
    Test, TestingModule,
} from "@nestjs/testing";
import {
    CustomResponse,
} from "@root/interface/response/custom-response";
import {
    ConfigService,
} from "@nestjs/config";
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
    supertestRequestFunction, 
} from "@root/util/function/supertest-request.function";
import {
    GetMemberResponseDto, 
} from "@member/dto/res/get-member.response.dto";
import {
    uuidFunction, 
} from "@root/util/function/uuid.function";
import {
    ErrorData, 
} from "@root/interface/response/error.data";
import {
    MemberEntity, 
} from "@member/entity/member.entity";
import {
    memberRandomFixture, 
} from "../fixture/entity/member.fixture";
import {
    bcryptFunction, 
} from "@root/util/function/bcrypt.function";
import {
    generateRandomPasswordFunction, 
} from "@root/util/function/random-password.function";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";
import {
    PaginateData, 
} from "@root/interface/response/paginate.data";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";
import {
    MemberOptionDto, 
} from "@root/interface/request/member-option.dto";
import {
    GetMemberDetailResponseDto, 
} from "@member/dto/res/get-member-detail.response.dto";
import {
    UpdateMemberRequestDto, 
} from "@member/dto/req/update-member.request.dto";
import {
    UpdateMemberResponseDto, 
} from "@member/dto/res/update-member.response.dto";
import {
    UpdateMemberPasswordRequestDto, 
} from "@member/dto/req/update-member-password.request.dto";
import {
    UpdateMemberJoinStatusRequestDto, 
} from "@member/dto/req/update-member-join-status-request.dto";
import {
    UpdateMemberAuthorityRequestDto, 
} from "@member/dto/req/update-member-authority.request.dto";

describe("Member e2e Test", () => {
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
                    const {
                        storedMember, token,
                    } = await generateJwtToken(prismaService, jwtService, configService);
                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .get(`/members/${storedMember.id}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.OK);
                    // then
                    const actual = response.body as CustomResponse<GetMemberResponseDto>;
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
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService);

                    const failId = uuidFunction.v4();
                    const expectedPath = `/members/${failId}`;
                    const expectedStatus = HttpStatus.NOT_FOUND;
                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .get(`/members/${failId}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.NOT_FOUND);
                    // then
                    const actual = response.body as CustomResponse<ErrorData>;
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
            const {
                token,
            } = await generateJwtToken(prismaService, jwtService, configService);
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
            const actual = response.body as CustomResponse<PaginateData<GetMemberResponseDto>>;
            expect(actual.data.meta.totalCount).toBe(randomNumber + 1);
            expect(actual.data.meta.totalPage).toEqual(Math.ceil((randomNumber + 1) / request.limit));
            expect(actual.data.meta.page).toBe(request.page);
            expect(actual.data.meta.take).toBe(request.limit);
            expect(actual.data.meta.hasNextPage).toEqual(request.page < Math.ceil((randomNumber + 1) / request.limit));
        });
    });

    describe("getMemberDetailList", () => {
        describe("ADMIN, MANAGER의 권한의 사용자라면, ", () => {
            it("조건에 맞는 MemberList 정보를 보여줘야 한다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
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
                const paginateDto: PaginateRequestDto = {
                    page: 1,
                    limit: 10,
                };
                const memberOptionDto: MemberOptionDto = {
                    joinStatus: true,
                };

                // when
                const response = await supertestRequestFunction(app.getHttpServer())
                    .get("/members/detail")
                    .query({
                        ...paginateDto,
                        ...memberOptionDto,
                    })
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.OK);

                // then
                const actual = response.body as CustomResponse<PaginateData<GetMemberDetailResponseDto>>;
                expect(actual.data.meta.totalCount).toBe(randomNumber + 1);
                expect(actual.data.meta.totalPage).toEqual(Math.ceil((randomNumber + 1) / paginateDto.limit));
                expect(actual.data.meta.page).toBe(paginateDto.page);
                expect(actual.data.meta.take).toBe(paginateDto.limit);
                expect(actual.data.meta.hasNextPage)
                    .toEqual(paginateDto.page < Math.ceil((randomNumber + 1) / paginateDto.limit));
                actual.data.data.map(
                    (actualData) => expect(actualData.joinStatus).toEqual(memberOptionDto.joinStatus)
                );
            });
        });
        describe("MANAGER, ADMIN 권한이 아니라면, ", () => {
            it("권한 예외가 발생한다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);
                const paginateDto: PaginateRequestDto = {
                    page: 1,
                    limit: 10,
                };
                const memberOptionDto: MemberOptionDto = {
                    joinStatus: true,
                };

                // when
                await supertestRequestFunction(app.getHttpServer())
                    .get("/members/detail")
                    .query({
                        ...paginateDto,
                        ...memberOptionDto,
                    })
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.FORBIDDEN);
            });
        });
    });

    /**
     * 자신이 아닌 다른 멤버에 접근하는 예외는 이곳에서 처리하므로 중복되는 테스트는 진행하지 않음
     */
    describe("updateMember", () => {
        describe("자신의 정보를 바꾸는 경우", () => {
            describe("중복된 닉네임인 경우,", () => {
                it("중복 예외가 발생한다.", async () => {
                    // given
                    const {
                        token,storedMember,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const requestBody: UpdateMemberRequestDto = {
                        nickname: storedMember.nickname,
                        introduce: "updatedIntroduce",
                    };

                    // when, then
                    await supertestRequestFunction(app.getHttpServer())
                        .put(`/members/${storedMember.id}`)
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.BAD_REQUEST);
                });
            });
            describe("중복된 닉네임이 아닌 경우", () => {
                it("dto기반으로 값을 변경한다.", async () => {
                    // given
                    const {
                        token,storedMember,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                    const requestBody: UpdateMemberRequestDto = {
                        nickname: "update",
                        introduce: "updatedIntroduce",
                    };

                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .put(`/members/${storedMember.id}`)
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.CREATED);

                    // then
                    const actual = response.body as CustomResponse<UpdateMemberResponseDto>;
                    const actualMember = await prismaService.member.findUnique({
                        where: {
                            id: actual.data.id,
                        },
                    });
                    expect(actualMember.nickname).toBe(requestBody.nickname);
                    expect(actualMember.introduce).toBe(requestBody.introduce);
                });
            });
        });
        describe("다른 사람의 정보를 바꾸는 경우", () => {
            it("다른 자원에 접근했다는 예외가 발생한다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                const anotherRandomPassword = generateRandomPasswordFunction();
                const anotherEncryptedPassword
                    = await bcryptFunction.hash(anotherRandomPassword, await bcryptFunction.genSalt());
                const anotherMember = memberRandomFixture(anotherEncryptedPassword, true);
                const anotherStoredMember = await prismaService.member.create({
                    data: anotherMember,
                });
                const requestBody: UpdateMemberRequestDto = {
                    nickname: "updated",
                    introduce: "updatedIntroduce",
                };

                // when
                await supertestRequestFunction(app.getHttpServer())
                    .put(`/members/${anotherStoredMember.id}`)
                    .send(requestBody)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.FORBIDDEN);
            });
        });
    });

    describe("updateMemberPassword", () => {
        describe("현재 비밀번호가 일치하면,", () => {
            it("새로운 비밀번호로 비밀번호가 변경된다.", async () => {
                // given
                const {
                    token, currentPassword, storedMember,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                
                const newPassword = generateRandomPasswordFunction();
                const requestBody: UpdateMemberPasswordRequestDto = {
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                };

                // when
                const response = await supertestRequestFunction(app.getHttpServer())
                    .patch(`/members/${storedMember.id}/password`)
                    .send(requestBody)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.CREATED);

                // then
                const actual = response.body as CustomResponse<UpdateMemberResponseDto>;
                const actualMember = await prismaService.member.findUnique({
                    where: {
                        id: actual.data.id,
                    },
                });
                expect(await bcryptFunction.compare(newPassword, actualMember.password)).toBe(true);
            });
        });
        describe("현재 비밀번호가 일치하지 않으면,", () => {
            it("비밀번호가 틀렸다는 예외가 발생한다.", async () => {
                // given
                const {
                    token, storedMember,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);
                const randomPassword = generateRandomPasswordFunction();
                const newPassword = generateRandomPasswordFunction();
                const requestBody: UpdateMemberPasswordRequestDto = {
                    currentPassword: randomPassword,
                    newPassword: newPassword,
                };

                // when
                await supertestRequestFunction(app.getHttpServer())
                    .patch(`/members/${storedMember.id}/password`)
                    .send(requestBody)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });

    });

    describe("updateMemberJoinStatus", () => {
        describe("MANAGER, ADMIN 권한이라면, ", () => {
            describe("아직 회원가입 승인이 안된 사용자라면,", () => {
                it("회원가입을 하고 id를 돌려준다.", async () => {
                    // given
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);

                    const anotherRandomPassword = generateRandomPasswordFunction();
                    const anotherEncryptedPassword
                        = await bcryptFunction.hash(anotherRandomPassword, await bcryptFunction.genSalt());
                    const anotherMember = memberRandomFixture(anotherEncryptedPassword, false);
                    const anotherStoredMember = await prismaService.member.create({
                        data: anotherMember,
                    });
                    const requestBody: UpdateMemberJoinStatusRequestDto = {
                        joinStatus: true,
                    };

                    // when
                    const response = await supertestRequestFunction(app.getHttpServer())
                        .patch(`/members/${anotherStoredMember.id}/join`)
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.CREATED);

                    // then
                    const actual = response.body as CustomResponse<UpdateMemberResponseDto>;
                    const actualMember = await prismaService.member.findUnique({
                        where: {
                            id: actual.data.id,
                        },
                    });
                    expect(actualMember.joinStatus).toBe(true);
                });
            });
            describe("이미 회원가입 승인이 된 사용자라면,", () => {
                it("잘못된 요청이라는 예외를 발생시킨다.", async () => {
                    // given
                    const {
                        token,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);

                    const anotherRandomPassword = generateRandomPasswordFunction();
                    const anotherEncryptedPassword
                        = await bcryptFunction.hash(anotherRandomPassword, await bcryptFunction.genSalt());
                    const anotherMember = memberRandomFixture(anotherEncryptedPassword, true);
                    const anotherStoredMember = await prismaService.member.create({
                        data: anotherMember,
                    });
                    const requestBody: UpdateMemberJoinStatusRequestDto = {
                        joinStatus: true,
                    };

                    // when, then
                    await supertestRequestFunction(app.getHttpServer())
                        .patch(`/members/${anotherStoredMember.id}/join`)
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.BAD_REQUEST);
                });
            });
        });
        describe("ADMIN, MANGAER 권한의 사용자가 아니라면, ", () => {
            it("비인가 예외를 발생시켜야 한다.", async () => {
                // given
                const {
                    token,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.USER);

                const anotherRandomPassword = generateRandomPasswordFunction();
                const anotherEncryptedPassword
                    = await bcryptFunction.hash(anotherRandomPassword, await bcryptFunction.genSalt());
                const anotherMember = memberRandomFixture(anotherEncryptedPassword, true);
                const anotherStoredMember = await prismaService.member.create({
                    data: anotherMember,
                });
                const requestBody: UpdateMemberJoinStatusRequestDto = {
                    joinStatus: true,
                };

                // when
                await supertestRequestFunction(app.getHttpServer())
                    .patch(`/members/${anotherStoredMember.id}/join`)
                    .send(requestBody)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.FORBIDDEN);
            });
        });
    });

    describe("updateMemberAuthority", () => {
        describe("AMDIN 권한이라면, ", () => {
            describe("ADMIN 권한의 사용자를 수정하지 않는다면, ", () => {
                describe("대상이 회원가입을 완료했다면, ", () => {
                    it("대상의 권한을 변경해야 한다.", async () => {
                        const {
                            token,
                        } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.ADMIN);

                        const anotherRandomPassword = generateRandomPasswordFunction();
                        const anotherEncryptedPassword
                            = await bcryptFunction.hash(anotherRandomPassword, await bcryptFunction.genSalt());
                        const anotherMember = memberRandomFixture(anotherEncryptedPassword, true);
                        const anotherStoredMember = await prismaService.member.create({
                            data: anotherMember,
                        });
                        const requestBody: UpdateMemberAuthorityRequestDto = {
                            authority: MemberAuthority.MANAGER,
                        };

                        // when
                        const response = await supertestRequestFunction(app.getHttpServer())
                            .patch(`/members/${anotherStoredMember.id}/authority`)
                            .send(requestBody)
                            .set("Authorization", `Bearer ${token}`)
                            .expect(HttpStatus.CREATED);

                        const actual = response.body as CustomResponse<UpdateMemberResponseDto>;
                        const actualMember = await prismaService.member.findUnique({
                            where: {
                                id: actual.data.id,
                            },
                        });
                        expect(actualMember.id).toBe(anotherStoredMember.id);
                        expect(actualMember.authority).toBe(requestBody.authority);
                    });
                });
                describe("대상이 회원가입을 완료하지 않았다면, ", () => {
                    it("잘못된 요청 예외를 발생시킨다.", async () => {
                        // given
                        const {
                            token,
                        } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.ADMIN);

                        const anotherRandomPassword = generateRandomPasswordFunction();
                        const anotherEncryptedPassword
                            = await bcryptFunction.hash(anotherRandomPassword, await bcryptFunction.genSalt());
                        const anotherMember = memberRandomFixture(anotherEncryptedPassword, false);
                        const anotherStoredMember = await prismaService.member.create({
                            data: anotherMember,
                        });
                        const requestBody: UpdateMemberAuthorityRequestDto = {
                            authority: MemberAuthority.MANAGER,
                        };

                        // when
                        await supertestRequestFunction(app.getHttpServer())
                            .patch(`/members/${anotherStoredMember.id}/authority`)
                            .send(requestBody)
                            .set("Authorization", `Bearer ${token}`)
                            .expect(HttpStatus.BAD_REQUEST);
                    });
                });
            });
            describe("ADMIN 권한의 사용자를 수정한다면, ", () => {
                it("ADMIN 권한은 수정할 수 없다는 예외를 발생시켜야 한다.", async () => {
                    // given
                    const {
                        token, storedMember,
                    } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.ADMIN);

                    const requestBody: UpdateMemberAuthorityRequestDto = {
                        authority: MemberAuthority.MANAGER,
                    };

                    // when
                    await supertestRequestFunction(app.getHttpServer())
                        .patch(`/members/${storedMember.id}/authority`)
                        .send(requestBody)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(HttpStatus.BAD_REQUEST);
                });
            });
        });
        describe("AMDIN 권한이 아니라면, ", () => {
            it("권한 부족 예외를 발생시킨다.", async () => {
                // given
                const {
                    token, storedMember,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);

                const requestBody: UpdateMemberAuthorityRequestDto = {
                    authority: MemberAuthority.MANAGER,
                };

                // when
                await supertestRequestFunction(app.getHttpServer())
                    .patch(`/members/${storedMember.id}/authority`)
                    .send(requestBody)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.FORBIDDEN);
            });
        });
    });

    describe("deleteMember", () => {
        describe("존재하는 대상인 경우 ", () => {
            it("대상을 삭제하고 id는 null을 반환한다.", async () => {
                // given
                const {
                    token, storedMember,
                } = await generateJwtToken(prismaService, jwtService, configService, MemberAuthority.MANAGER);

                // when
                await supertestRequestFunction(app.getHttpServer())
                    .delete(`/members/${storedMember.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(HttpStatus.NO_CONTENT);

                // then
                const actualMember = await prismaService.member.findUnique({
                    where: {
                        id: storedMember.id,
                    },
                });
                expect(actualMember).toBeNull();
            });
        });
    });
});