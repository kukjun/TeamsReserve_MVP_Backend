import * as UUID from "uuid";
import {
    Test,
    TestingModule,
} from "@nestjs/testing";
import {
    faker,
} from "@faker-js/faker";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";
import {
    TeamUnauthenticatedException, 
} from "@root/exception/team-unauthenticated.exception";
import {
    EmailConfirmFailException, 
} from "@root/exception/email-confirm-fail.exception";
import {
    EmailUnauthenticatedException, 
} from "@root/exception/email-unauthenticated.exception";
import {
    DuplicateException, 
} from "@root/exception/duplicate.exception";
import {
    SigninFailException, 
} from "@root/exception/signin-fail.exception";
import {
    MemberNotFoundException, 
} from "@root/exception/member-not-found.exception";
import {
    confirmEmailRequestFixture, 
} from "@auth/spec/fixture/confirm-email-request.fixture";
import {
    AuthController, 
} from "@auth/auth.controller";
import {
    AuthService, 
} from "@auth/auth.service";
import {
    EmailTransferService, 
} from "@auth/email-transfer.service";
import {
    validateEmailRequestFixture, 
} from "@auth/spec/fixture/validate-email-request.fixture";
import {
    signupRequestFixture, 
} from "@auth/spec/fixture/signup-request.fixture";
import {
    signinRequestFixture, 
} from "@auth/spec/fixture/signin-request.fixture";

const authServiceMock = {
    signup: jest.fn(),
    signin: jest.fn(),
    validateSignin: jest.fn(),
};
const emailTransferServiceMock = {
    validateEmail: jest.fn(),
    confirmEmail: jest.fn(),
    updateTempPassword: jest.fn(),
};
const mockReq = {
    user: {
        id: UUID.v4(),
        nickname: "TestNickname",
        authority: MemberAuthority.USER,
    },
};

describe("AuthController Unit Test", () => {
    let authController: AuthController;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController,],
            providers: [{
                provide: AuthService,
                useValue: authServiceMock,
            },
            {
                provide: EmailTransferService,
                useValue: emailTransferServiceMock,
            },],
        }).compile();
        authController = module.get(AuthController);
    });

    it("AuthController가 정의 되어야 한다.", async () => {
        expect(authController).toBeDefined();
    });

    describe("validateEmail", () => {
        it("이메일 요청이 이루어지면, 회원의 Email을 반환한다.", async () => {
            // given
            const request = validateEmailRequestFixture();
            emailTransferServiceMock.validateEmail.mockResolvedValue({
                email: request.email,
            });
            // when
            const result = await authController.validateEmail(request);
            // then
            expect(result).not.toBeNull();
            expect(result.data.email).toEqual(request.email);
        });

    });

    describe("confirmEmail", () => {
        it("인증코드가 일치하면, 회원의 Email을 발급한다.", async () => {
            // given
            const request = confirmEmailRequestFixture();
            emailTransferServiceMock.confirmEmail.mockResolvedValue({
                email: request.email,
            });
            // when
            const result = await authController.confirmEmail(request);
            // then
            expect(result).not.toBeNull();
            expect(result.data.email).toEqual(request.email);
        });

        it("인증코드가 일치하지 않으면, 인증코드 불일치 예외가 발생한다.", async () => {
            // given
            const request = confirmEmailRequestFixture();
            emailTransferServiceMock.confirmEmail.mockImplementation(() => {
                throw new EmailConfirmFailException();
            });

            // when
            try {
                await authController.confirmEmail(request);
                new Error();
            } catch (error) {
                // then
                expect(error instanceof EmailConfirmFailException).toBe(true);
            }
        });
    });

    describe("signup", () => {
        it("회원가입 가능한 Member라면, 회원가입하고 사용자의 id를 돌려준다.", async () => {
            // given
            const request = signupRequestFixture();
            const expectedId = faker.string.uuid();
            authServiceMock.signup.mockResolvedValue({
                id: expectedId,
            });
            // when
            const result = await authController.signup(request);
            // then
            expect(result).not.toBeNull();
            expect(result.data.id).toEqual(expectedId);
        });

        it("TeamCode가 일치하지 않으면, 해당 예외를 돌려준다.", async () => {
            // given
            const request = signupRequestFixture();
            authServiceMock.signup.mockImplementation(() => {
                throw new TeamUnauthenticatedException();
            });
            // when
            try {
                await authController.signup(request);
                new Error();
            } catch (error) {
                // then
                expect(error instanceof TeamUnauthenticatedException).toBe(true);
            }
        });

        it("인증되지 않은 이메일이라면, 해당 예외를 돌려준다.", async () => {
            // given
            const request = signupRequestFixture();
            authServiceMock.signup.mockImplementation(() => {
                throw new EmailUnauthenticatedException();
            });
            // when
            try {
                await authController.signup(request);
                new Error();
            } catch (error) {
                // then
                expect(error instanceof EmailUnauthenticatedException).toBe(true);
            }
        });

        it("중복된 이메일이라면, 해당 예외를 돌려준다.", async () => {
            // given
            const request = signupRequestFixture();
            authServiceMock.signup.mockImplementation(() => {
                throw new DuplicateException("email: " + request.email + " duplicate");
            });
            // when
            try {
                await authController.signup(request);
                new Error();
            } catch (error) {
                // then
                expect(error instanceof DuplicateException).toBe(true);
            }
        });

        it("중복된 닉네임이라면, 해당 예외를 돌려준다.", async () => {
            // given
            const request = signupRequestFixture();
            authServiceMock.signup.mockImplementation(() => {
                throw new DuplicateException("nickname: " + request.nickname + " duplicate");
            });
            // when
            try {
                await authController.signup(request);
                new Error();
            } catch (error) {
                // then
                expect(error instanceof DuplicateException).toBe(true);
            }
        });
    });

    describe("signin", () => {
        it("사용자의 id, password가 일치하면 accessToken을 돌려준다.", async () => {
            // given
            const request = signinRequestFixture();
            const expectedUUID = UUID.v4();

            const expectedJWTToken = "JWT_Example_Token";
            authServiceMock.signin.mockResolvedValue({
                accessToken: expectedJWTToken,
            });
            authServiceMock.validateSignin.mockResolvedValue(
                expectedUUID
            );
            // when
            const result = await authController.signin(request, mockReq);
            // then
            expect(result).not.toBeNull();
            expect(result.data.accessToken).toEqual(expectedJWTToken);
        });

        it("Member의 id, password가 일치하지 않거나 승인되지 않은 경우 로그인 실패 예외를 발생시킨다.", async () => {
            // given
            const request = signinRequestFixture();
            authServiceMock.validateSignin.mockImplementation(() => {
                throw new SigninFailException();
            });
            // when
            try {
                await authController.signin(request, mockReq);
                new Error();
            } catch (error) {
                // then
                expect(error instanceof SigninFailException).toBe(true);
            }
        });
    });

    describe("updateTempPassword", () => {
        it("인증코드가 일치하면, 회원에게 임시 비밀번호 발급한다.", async () => {
            // given
            const request = confirmEmailRequestFixture();
            emailTransferServiceMock.updateTempPassword.mockResolvedValue({
                email: request.email,
            });
            // when
            const result = await authController.updateTempPassword(request);
            // then
            expect(result).not.toBeNull();
            expect(result.data.email).toEqual(request.email);
        });

        it("인증코드가 일치하지만 가입한 회원이 아니면, 멤버를 찾을 수 없다는 예외가 발생한다.", async () => {
            // given
            const request = confirmEmailRequestFixture();
            emailTransferServiceMock.updateTempPassword.mockImplementation(() => {
                throw new MemberNotFoundException(`email: ${request.email}`);
            });

            // when
            try {
                await authController.confirmEmail(request);
                new Error();
            } catch (error) {
                // then
                expect(error instanceof EmailConfirmFailException).toBe(true);
            }
        });

        it("인증코드가 일치하지 않으면, 인증코드 불일치 예외가 발생한다.", async () => {
            // given
            const request = confirmEmailRequestFixture();
            emailTransferServiceMock.updateTempPassword.mockImplementation(() => {
                throw new EmailConfirmFailException();
            });

            // when
            try {
                await authController.confirmEmail(request);
                new Error();
            } catch (error) {
                // then
                expect(error instanceof EmailConfirmFailException).toBe(true);
            }
        });
    });
});