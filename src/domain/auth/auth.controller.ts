import {
    Body,
    Controller, Post,
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
    @Post("/validate-email")
    async validateEmail(@Body() request: ValidateEmailRequest) {
        const data = await this.emailTransferService.validateEmail(request);

        return new DefaultResponse(data);
    }

    /**
     * email 인증 확인 api
     * @param request
     */
    @Post("confirm-email")
    async confirmEmail(@Body() request: ConfirmEmailRequest) {
        const data = await this.emailTransferService.confirmEmail(request);

        return new DefaultResponse(data);
    }

    // 회원가입 api
    // 로그인 api
}