import {
    Controller, 
} from "@nestjs/common";
import {
    AuthService, 
} from "./auth.service";
import {
    EmailTransferService, 
} from "./email-transfer.service";

@Controller()
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly emailTransferService: EmailTransferService
    ) {
    }

    // email 인증 요청 api
    // email 인증 확인 api
    // 회원가입 api
    // 로그인 api
}