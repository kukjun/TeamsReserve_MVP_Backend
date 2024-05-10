import {
    AuthController, 
} from "../auth.controller";
import {
    Test,
    TestingModule,
} from "@nestjs/testing";
import {
    AuthService, 
} from "../auth.service";
import {
    EmailTransferService, 
} from "../email-transfer.service";
import {
    validateEmailRequestFixture, 
} from "./fixture/validate-email-request.fixture";
import {
    confirmEmailRequestFixture, 
} from "./fixture/confirm-email-request.fixture";
import {
    EmailConfirmFailException, 
} from "../../../exception/email-confirm-fail.exception";
import {
    faker, 
} from "@faker-js/faker";
import {
    signupRequestFixture,
} from "./fixture/signup-request.fixture";
import {
    TeamUnauthorizedException, 
} from "../../../exception/team-unauthorized.exception";
import {
    EmailUnauthorizedException, 
} from "../../../exception/email-unauthorized.exception";
import {
    DuplicateException, 
} from "../../../exception/duplicate.exception";
import {
    signinRequestFixture, 
} from "./fixture/signin-request.fixture";
import {
    SigninFailException, 
} from "../../../exception/signin-fail.exception";

const authServiceMock = {
    signup: jest.fn(),
    signin: jest.fn(),
};
const emailTransferServiceMock = {
    validateEmail: jest.fn(),
    confirmEmail: jest.fn(),

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
                throw new TeamUnauthorizedException();
            });
            // when
            try {
                await authController.signup(request);
                new Error();
            } catch(error) {
                // then
                expect(error instanceof TeamUnauthorizedException).toBe(true);
            }
        });

        it("인증되지 않은 이메일이라면, 해당 예외를 돌려준다.", async () => {
            // given
            const request = signupRequestFixture();
            authServiceMock.signup.mockImplementation(() => {
                throw new EmailUnauthorizedException();
            });
            // when
            try {
                await authController.signup(request);
                new Error();
            } catch(error) {
                // then
                expect(error instanceof EmailUnauthorizedException).toBe(true);
            }
        });

        it("중복된 이메일이라면, 해당 예외를 돌려준다.", async () => {
            // given
            const request = signupRequestFixture();
            const expectedMessage = "email: " + request.email + " duplicate - Bad Request";
            authServiceMock.signup.mockImplementation(() => {
                throw new DuplicateException("email: " + request.email + " duplicate");
            });
            // when
            try {
                await authController.signup(request);
                new Error();
            } catch(error) {
                // then
                expect(error instanceof DuplicateException).toBe(true);
                expect(error.message).toEqual(expectedMessage);
            }
        });

        it("중복된 닉네임이라면, 해당 예외를 돌려준다.", async () => {
            // given
            const request = signupRequestFixture();
            const expectedMessage = "nickname: " + request.nickname + " duplicate - Bad Request";
            authServiceMock.signup.mockImplementation(() => {
                throw new DuplicateException("nickname: " + request.nickname + " duplicate");
            });
            // when
            try {
                await authController.signup(request);
                new Error();
            } catch(error) {
                // then
                expect(error instanceof DuplicateException).toBe(true);
                expect(error.message).toEqual(expectedMessage);
            }
        });
    });

    describe("signin", () => {
        it("사용자의 id, password가 일치하면 accessToken을 돌려준다.", async () => {
            // given
            const request = signinRequestFixture();
            const expectedJWTToken = "JWT_Example_Token";
            authServiceMock.signin.mockResolvedValue({
                accessToken: expectedJWTToken,
            });
            // when
            const result = await authController.signin(request);
            // then
            expect(result).not.toBeNull();
            expect(result.data.accessToken).toEqual(expectedJWTToken);
        });

        it("Member의 id, password가 일치하지 않거나 승인되지 않은 경우 로그인 실패 예외를 발생시킨다.", async () => {
            // given
            const request = signinRequestFixture();
            authServiceMock.signin.mockImplementation(() => {
                throw new SigninFailException();
            });
            // when
            try {
                await authController.signin(request);
                new Error();
            } catch(error) {
                // then
                expect(error instanceof SigninFailException).toBe(true);
            }
        });
    });
});