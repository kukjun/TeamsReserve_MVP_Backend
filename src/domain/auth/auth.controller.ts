import {
    ApiExtraModels, ApiOperation, ApiTags,
} from "@nestjs/swagger";
import {
    Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Request,
} from "@nestjs/common";
import {
    AuthService, 
} from "@auth/auth.service";
import {
    EmailTransferService, 
} from "@auth/email-transfer.service";
import {
    ValidateEmailResponse, 
} from "@auth/dto/res/validate-email.response";
import {
    ValidateEmailRequest, 
} from "@auth/dto/req/validate-email.request";
import {
    ConfirmEmailResponse, 
} from "@auth/dto/res/confirm-email.response";
import {
    ConfirmEmailRequest, 
} from "@auth/dto/req/confirm-email.request";
import {
    SignupResponse, 
} from "@auth/dto/res/signup.response";
import {
    SignupRequest, 
} from "@auth/dto/req/signup.request";
import {
    SigninResponse, 
} from "@auth/dto/res/signin.response";
import {
    LocalGuard, 
} from "@auth/guards/local.guard";
import {
    SigninRequest, 
} from "@auth/dto/req/signin.request";
import {
    ApiCustomResponseDecorator,
} from "@root/util/decorators/api-custom-response.decorator";
import {
    CustomResponse,
} from "@root/interface/response/custom-response";

@ApiTags("auth")
@ApiExtraModels(CustomResponse)
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
    @ApiCustomResponseDecorator(ValidateEmailResponse)
    @HttpCode(HttpStatus.CREATED)
    @Post("/validate-email")
    async validateEmail(@Body() request: ValidateEmailRequest) {
        const data = await this.emailTransferService.validateEmail(request);

        return new CustomResponse(data);
    }

    /**
     * email 인증 확인 api
     * @param request
     */
    @ApiOperation({
        summary: "이메일 인증 확인 API",
        description: "받은 인증번호를 5분 이내로 입력해서, 본인 이메일임을 인증한다.",
    })
    @ApiCustomResponseDecorator(ConfirmEmailResponse)
    @HttpCode(HttpStatus.CREATED)
    @Post("confirm-email")
    async confirmEmail(@Body() request: ConfirmEmailRequest) {
        const data = await this.emailTransferService.confirmEmail(request);

        return new CustomResponse(data);
    }

    /**
     * 회원가입 api
     * @param request
     */
    @ApiOperation({
        summary: "회원 가입 API",
        description: "인증된 이메일로 1시간 이내로, 회원가입을 한다.",
    })
    @ApiCustomResponseDecorator(SignupResponse)
    @HttpCode(HttpStatus.CREATED)
    @Post("/signup")
    async signup(@Body() request: SignupRequest) {

        const data = await this.authService.signup(request);

        return new CustomResponse(data);
    }

    /**
     * 로그인 api
     * @param request
     */
    @ApiOperation({
        summary: "로그인 API",
        description: "관리자로부터 로그인 승인을 받으면, 해당 id, password로 로그인을 한다.",
    })
    @ApiCustomResponseDecorator(SigninResponse)
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalGuard)
    @Post("/signin")
    async signin(@Body() request: SigninRequest, @Request() req) {

        const data = await this.authService.signin(req.user.id);

        return new CustomResponse(data);

    }

    /**
     * 임시 비밀번호 발급 API
     * @param request
     */
    @ApiOperation({
        summary: "임시 비밀번호 발급",
        description: "본인 이메일임을 인증하고, 임시 비밀번호를 생성 해, 이메일로 전송한다.",
    })
    @ApiCustomResponseDecorator(ConfirmEmailResponse)
    @HttpCode(HttpStatus.OK)
    @Post("/tempPassword")
    async updateTempPassword(@Body() request: ConfirmEmailRequest): Promise<CustomResponse<ConfirmEmailResponse>> {

        const data = await this.emailTransferService.updateTempPassword(request);

        return new CustomResponse(data);

    }
}