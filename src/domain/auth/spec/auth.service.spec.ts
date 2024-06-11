import {
    AuthService,
} from "@auth/auth.service";
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
    MemberRepository,
} from "@member/member.repository";
import {
    getRedisToken,
} from "@liaoliaots/nestjs-redis";
import {
    signupRequestFixture,
} from "@auth/spec/fixture/signup-request.fixture";
import {
    memberFixture,
} from "../../../../test/fixture/entity/member.fixture";
import {
    bcryptFunction,
} from "@root/util/function/bcrypt.function";
import {
    uuidFunction,
} from "@root/util/function/uuid.function";
import {
    DuplicateException,
} from "@root/exception/duplicate.exception";
import {
    EmailUnauthenticatedException,
} from "@root/exception/email-unauthenticated.exception";
import {
    TeamUnauthenticatedException,
} from "@root/exception/team-unauthenticated.exception";
import {
    signinRequestFixture,
} from "@auth/spec/fixture/signin-request.fixture";
import {
    SigninFailException,
} from "@root/exception/signin-fail.exception";
import {
    MemberNotFoundException, 
} from "@root/exception/member-not-found.exception";

const clientMock = {
    get: jest.fn(),
};
const memberRepositoryMock = {
    findMemberByEmail: jest.fn(),
    findMemberByNickname: jest.fn(),
    saveMember: jest.fn(),
    findMemberById: jest.fn(),
};
const jwtServiceMock = {
    sign: jest.fn(),
};

const configServiceMock = {
    get: jest.fn(),
};

describe("Auth Service Test", () => {
    let authService: AuthService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRedisToken("default"),
                    useValue: clientMock,
                }, // Redis 클라이언트 주입
                {
                    provide: MemberRepository,
                    useValue: memberRepositoryMock,
                },
                {
                    provide: JwtService,
                    useValue: jwtServiceMock,
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
            ],
        }).compile();

        authService = module.get(AuthService);
    });

    describe("AuthService는 정의되어야 한다.", () => {
        it("should Defined", () => {
            expect(authService).toBeDefined();
        });
    });

    describe("signup", () => {
        describe("email 인증을 받은 사용자이면,", () => {
            describe("팀 코드가 같고, 중복된 이메일, 닉네임이 아니면, ", () => {
                it("회원가입에 성공한다.", async () => {
                    // given
                    const dto = signupRequestFixture();
                    clientMock.get.mockResolvedValue("validate");
                    const expectedId = uuidFunction.v4();
                    memberRepositoryMock.findMemberByEmail.mockResolvedValue(null);
                    memberRepositoryMock.findMemberByNickname.mockResolvedValue(null);
                    memberRepositoryMock.saveMember.mockResolvedValue(expectedId);

                    // when
                    const result = await authService.signup(dto);

                    // when
                    expect(result.id).toBe(expectedId);
                });
            });
            describe("팀 코드가 다르면, ", () => {
                it("비인가 팀코드 예외가 발샐한다.", async () => {
                    // given
                    const dto = signupRequestFixture();
                    dto.teamCode = "UPDATE_TEAM_CODE";
                    clientMock.get.mockResolvedValue("validate");
                    // when
                    try {
                        await authService.signup(dto);
                        new Error();
                    } catch (error) {
                        // then
                        expect(error instanceof TeamUnauthenticatedException).toBe(true);
                    }
                });
            });
            describe("중복된 이메일이면, ", () => {
                it("중복예외가 발샐한다.", async () => {
                    // given
                    const dto = signupRequestFixture();
                    clientMock.get.mockResolvedValue("validate");
                    const encryptedPassword = await bcryptFunction.hash("testPassword", await bcryptFunction.genSalt());
                    const entity = memberFixture(encryptedPassword);
                    const expectedId = uuidFunction.v4();
                    memberRepositoryMock.findMemberByEmail.mockResolvedValue(entity);
                    memberRepositoryMock.findMemberByNickname.mockResolvedValue(null);
                    memberRepositoryMock.saveMember.mockResolvedValue(expectedId);

                    // when
                    try {
                        await authService.signup(dto);
                        new Error();
                    } catch (error) {
                        // then
                        expect(error instanceof DuplicateException).toBe(true);
                    }
                });
            });
            describe("중복된 닉네임이면, ", () => {
                it("중복예외가 발샐한다.", async () => {
                    // given
                    const dto = signupRequestFixture();
                    clientMock.get.mockResolvedValue("validate");
                    const encryptedPassword = await bcryptFunction.hash("testPassword", await bcryptFunction.genSalt());
                    const entity = memberFixture(encryptedPassword);
                    const expectedId = uuidFunction.v4();
                    memberRepositoryMock.findMemberByEmail.mockResolvedValue(null);
                    memberRepositoryMock.findMemberByNickname.mockResolvedValue(entity);
                    memberRepositoryMock.saveMember.mockResolvedValue(expectedId);

                    // when
                    try {
                        await authService.signup(dto);
                        new Error();
                    } catch (error) {
                        // then
                        expect(error instanceof DuplicateException).toBe(true);
                    }
                });
            });
        });
        describe("email 인증을 받지 않은 사용자이면,", () => {
            it("이메일 비인증 예외가 발생한다..", async () => {
                // given
                const dto = signupRequestFixture();
                clientMock.get.mockResolvedValue(null);
                const expectedId = uuidFunction.v4();
                memberRepositoryMock.findMemberByEmail.mockResolvedValue(null);
                memberRepositoryMock.findMemberByNickname.mockResolvedValue(null);
                memberRepositoryMock.saveMember.mockResolvedValue(expectedId);

                // when
                try {
                    await authService.signup(dto);
                    new Error();
                } catch (error) {
                    // then
                    expect(error instanceof EmailUnauthenticatedException).toBe(true);

                }
            });
        });
    });

    describe("validateSignin", () => {
        describe("존재하는 member의 email과 password를 입력하면", () => {
            it("id를 반환한다.", async () => {
                // given
                const encryptedPassword = await bcryptFunction.hash("testPassword", await bcryptFunction.genSalt());
                const entity = memberFixture(encryptedPassword);
                const dto = signinRequestFixture(entity.email, "testPassword");

                memberRepositoryMock.findMemberByEmail.mockResolvedValue(entity);

                // when
                const result = await authService.validateSignin(dto);

                // then
                expect(result).toBe(entity.id);
            });
        });
        describe("아직 가입 승인이 되지 않은 사용자의 email을 입력하면, ", () => {
            it("로그인 실패 예외가 발생한다.", async () => {
                // given
                const encryptedPassword = await bcryptFunction.hash("testPassword", await bcryptFunction.genSalt());
                const entity = memberFixture(encryptedPassword, false);
                const dto = signinRequestFixture();

                memberRepositoryMock.findMemberByEmail.mockResolvedValue(entity);

                // when
                try {
                    await authService.validateSignin(dto);
                    new Error();
                } catch (error) {
                    // then
                    expect(error instanceof SigninFailException).toBe(true);
                }
            });
        });
        describe("존재하지 않는 email을 입력하면, ", () => {
            it("로그인 실패 예외가 발생한다.", async () => {
                // given
                const encryptedPassword = await bcryptFunction.hash("testPassword", await bcryptFunction.genSalt());
                const entity = memberFixture(encryptedPassword);
                const dto = signinRequestFixture();

                memberRepositoryMock.findMemberByEmail.mockResolvedValue(entity);

                // when
                try {
                    await authService.validateSignin(dto);
                    new Error();
                } catch (error) {
                    // then
                    expect(error instanceof SigninFailException).toBe(true);
                }
            });
        });
        describe("password가 틀리면, ", () => {
            it("로그인 실패 예외가 발생한다.", async () => {
                // given
                const encryptedPassword = await bcryptFunction.hash("testPassword", await bcryptFunction.genSalt());
                const entity = memberFixture(encryptedPassword);
                const dto = signinRequestFixture(entity.email, "anotherPassword");

                memberRepositoryMock.findMemberByEmail.mockResolvedValue(entity);

                // when
                try {
                    await authService.validateSignin(dto);
                    new Error();
                } catch (error) {
                    // then
                    expect(error instanceof SigninFailException).toBe(true);
                }
            });
        });
    });

    describe("signin", () => {
        describe("id에 해당하는 member가 존재하면", () => {
            it("member에 해당하는 token을 발급해준다.", async () => {
                // given
                const encryptedPassword = await bcryptFunction.hash("testPassword", await bcryptFunction.genSalt());
                const entity = memberFixture(encryptedPassword);
                const expectedJWTToken = "testToken";

                memberRepositoryMock.findMemberById.mockResolvedValue(entity);
                jwtServiceMock.sign.mockReturnValue(expectedJWTToken);

                // when
                const result = await authService.signin(entity.id);

                // then
                expect(result.accessToken).toBe(expectedJWTToken);
            });
        });
        describe("id에 해당하는 member가 존재하지 않으면", () => {
            it("Member를 찾을 수 없다는 예외를 발생시킨다.", async () => {
                // given
                const memberId = uuidFunction.v4();
                memberRepositoryMock.findMemberById.mockResolvedValue(null);

                // when
                try {
                    await authService.signin(memberId);
                    new Error();
                } catch (error) {
                    // then
                    expect(error instanceof MemberNotFoundException).toBe(true);

                }
            });
        });

    });
});
