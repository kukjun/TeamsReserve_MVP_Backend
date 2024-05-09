import {
    Body,
    Controller, HttpCode, Post,
} from "@nestjs/common";
import {
    AuthService,
} from "./auth.service";
import {
    EmailTransferService,
} from "./email-transfer.service";
import {
    ValidateEmailRequest,
} from "./dto/req/validate-email.request";
import {
    DefaultResponse,
} from "../../response/default.response";
import {
    ConfirmEmailRequest,
} from "./dto/req/confirm-email.request";
import {
    SignupRequest,
} from "./dto/req/signup.request";
import {
    SigninRequest,
} from "./dto/req/signin.request";
import {
    ApiExtraModels,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import {
    SignupResponse,
} from "./dto/res/signup.response";
import {
    ValidateEmailResponse,
} from "./dto/res/validate-email.response";
import {
    ConfirmEmailResponse,
} from "./dto/res/confirm-email.response";
import {
    SigninResponse,
} from "./dto/res/signin.response";
import {
    ApiDefaultResponse, 
} from "../../util/decorators/api-default.response";

@ApiTags("auth")
@ApiExtraModels(DefaultResponse, ValidateEmailResponse)
@Controller("/auth")
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly emailTransferService: EmailTransferService
    ) {
    }

    /**
     * email 인증 요청 api
     * @param request
     */
    @ApiOperation({
        summary: "이메일 인증 요청 API",
        description: "자신의 이메일로 인증번호를 받는다.",
    })
    @ApiDefaultResponse(ValidateEmailResponse)
    @HttpCode(201)
    @Post("/validate-email")
    async validateEmail(@Body() request: ValidateEmailRequest) {
        const data = await this.emailTransferService.validateEmail(request);

        return new DefaultResponse(data);
    }

    /**
     * email 인증 확인 api
     * @param request
     */
    @ApiOperation({
        summary: "이메일 인증 확인 API",
        description: "받은 인증번호를 5분 이내로 입력해서, 본인 이메일임을 인증한다.",
    })
    @ApiDefaultResponse(ConfirmEmailResponse)
    @HttpCode(201)
    @Post("confirm-email")
    async confirmEmail(@Body() request: ConfirmEmailRequest) {
        const data = await this.emailTransferService.confirmEmail(request);

        return new DefaultResponse(data);
    }

    /**
     * 회원가입 api
     * @param request
     */
    @ApiOperation({
        summary: "회원 가입 API",
        description: "인증된 이메일로 1시간 이내로, 회원가입을 한다.",
    })
    @ApiDefaultResponse(SignupResponse)
    @HttpCode(201)
    @Post("/signup")
    async signup(@Body() request: SignupRequest) {
        const data = await this.authService.signup(request);

        return new DefaultResponse(data);
    }

    /**
     * 로그인 api
     * @param request
     */
    @ApiOperation({
        summary: "로그인 API",
        description: "관리자로부터 로그인 승인을 받으면, 해당 id, password로 로그인을 한다.",
    })
    @ApiDefaultResponse(SigninResponse)
    @HttpCode(200)
    @Post("/signin")
    async signin(@Body() request: SigninRequest) {
        const data = await this.authService.signin(request);

        return new DefaultResponse(data);
    }
}