import * as nodemailer from "nodemailer";
import {
    Injectable,
} from "@nestjs/common";
import {
    ConfigService,
} from "@nestjs/config";
import {
    ValidateEmailRequest,
} from "./dto/req/validate-email.request";
import {
    ValidateEmailResponse,
} from "./dto/res/validate-email.response";
import Redis from "ioredis";
import {
    InjectRedis,
} from "@liaoliaots/nestjs-redis";
import {
    generateRandomNumber,
} from "../../util/random.function";
import {
    EmailOptions,
} from "../../interface/email-options";
import {
    ConfirmEmailRequest,
} from "./dto/req/confirm-email.request";
import {
    ConfirmEmailResponse,
} from "./dto/res/confirm-email.response";
import {
    EmailConfirmFailException, 
} from "../../exception/email-confirm-fail.exception";

@Injectable()
export class EmailTransferService {
    private transporter;
    private hostAccount: string;
    private validateLimitTime: number;
    private signupLimitTime: number;
    private validateEmailPrefix: string = "validateEmail-";

    constructor(
        @InjectRedis() private readonly client: Redis,
        configService: ConfigService
    ) {
        this.hostAccount = configService.get<string>("EMAIL_ACCOUNT");
        this.transporter = nodemailer.createTransport({
            service: configService.get<string>("EMAIL_SERVICE_NAME"),
            auth: {
                user: this.hostAccount,
                pass: configService.get<string>("EMAIL_PASSWORD"),
            },
        });
        this.validateLimitTime = configService.get<number>("VALIDATE_LIMIT_TIME");
        this.signupLimitTime = configService.get<number>("SIGNUP_LIMIT_TIME");
    }

    async validateEmail(request: ValidateEmailRequest): Promise<ValidateEmailResponse> {
        const code = generateRandomNumber().toString();
        const emailOptions: EmailOptions = {
            from: this.hostAccount,
            to: request.email,
            subject: "Validate Email - TeamsReserve",
            html: `<h1> TeamsReserve 이메일 인증 </h1> <p>code: ${code}</p> </br> <p>제한 시간은 5분입니다.</p>`,
        };

        this.transporter.sendMail(emailOptions);

        const key = this.validateEmailPrefix + request.email;
        await this.client.set(key, code, "EX", this.validateLimitTime);

        return {
            email: request.email,
        };
    }

    async confirmEmail(request: ConfirmEmailRequest): Promise<ConfirmEmailResponse> {
        const key = this.validateEmailPrefix + request.email;
        const resCode: string | null = await this.client.get(key);

        if(resCode === null || resCode !== request.code) throw new EmailConfirmFailException("Email Confirm Fail");
        await this.client.del(key);
        await this.client.set(request.email, "validate", "EX", this.signupLimitTime);

        return {
            email: request.email,
        };
    }
}