import * as nodemailer from "nodemailer";
import {
    Injectable,
} from "@nestjs/common";
import {
    ConfigService,
} from "@nestjs/config";
import Redis from "ioredis";
import {
    InjectRedis,
} from "@liaoliaots/nestjs-redis";
import * as bcrypt from "bcrypt";
import {
    MemberRepository,
} from "@member/member.repository";
import {
    ValidateEmailRequest,
} from "@auth/dto/req/validate-email.request";
import {
    ValidateEmailResponse,
} from "@auth/dto/res/validate-email.response";
import {
    generateRandomCodeFunction,
} from "@root/util/function/random-code.function";
import {
    EmailOptions,
} from "@root/interface/email-options";
import {
    ConfirmEmailRequest,
} from "@auth/dto/req/confirm-email.request";
import {
    ConfirmEmailResponse,
} from "@auth/dto/res/confirm-email.response";
import {
    EmailConfirmFailException,
} from "@root/exception/email-confirm-fail.exception";
import {
    MemberNotFoundException,
} from "@root/exception/member-not-found.exception";
import {
    generateRandomPasswordFunction,
} from "@root/util/function/random-password.function";
import {
    MemberEntity,
} from "@member/entity/member.entity";

@Injectable()
export class EmailTransferService {
    private transporter;
    private hostAccount: string;
    private validateLimitTime: number;
    private signupLimitTime: number;
    private validateEmailPrefix: string = "validateEmail-";

    constructor(
        @InjectRedis() private readonly client: Redis,
        private readonly memberRepository: MemberRepository,
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
        this.validateLimitTime = configService.get<number>("VALIDATE_LIMIT_TIME") ?? 600;
        this.signupLimitTime = configService.get<number>("SIGNUP_LIMIT_TIME") ?? 3600;
    }

    async validateEmail(request: ValidateEmailRequest): Promise<ValidateEmailResponse> {
        const code = generateRandomCodeFunction().toString();
        this.transportEmail(
            request.email,
            "Validate Email - TeamsReserve",
            `<h1> TeamsReserve 이메일 인증 </h1> <p>code: ${code}</p> </br> <p>제한 시간은 5분입니다.</p>`
        );

        const key = this.validateEmailPrefix + request.email;
        await this.client.set(key, code, "EX", this.validateLimitTime);

        return {
            email: request.email,
        };
    }

    async confirmEmail(request: ConfirmEmailRequest): Promise<ConfirmEmailResponse> {
        const key = this.validateEmailPrefix + request.email;
        await this.validateCode(key, request.code);

        await this.client.set(request.email, "validate", "EX", this.signupLimitTime);

        return {
            email: request.email,
        };
    }

    async updateTempPassword(request: ConfirmEmailRequest): Promise<ConfirmEmailResponse> {
        const key = this.validateEmailPrefix + request.email;
        await this.validateCode(key, request.code);

        const member = await this.memberRepository.findMemberByEmail(request.email);
        if (!member) throw new MemberNotFoundException(`email: ${request.email}`);

        const tempPassword = generateRandomPasswordFunction();
        await this.updatePassword(member, tempPassword);

        this.transportEmail(
            request.email,
            "Temp Password - TeamsReserve",
            `<h1> TeamsReserve ${member.nickname}님 비밀번호 발급 </h1> <p>Temp Password: ${tempPassword}</p>`
        );

        return {
            email: request.email,
        };
    }

    private transportEmail(to: string, subject: string, html: string) {
        const emailOptions: EmailOptions = {
            from: this.hostAccount,
            to,
            subject,
            html,
        };
        this.transporter.sendMail(emailOptions);
    }

    private async validateCode(key: string, code: string) {
        const resCode: string | null = await this.client.get(key);
        if (resCode === null || resCode !== code) throw new EmailConfirmFailException();
        await this.client.del(key);
    }

    private async updatePassword(member: MemberEntity, password: string) {
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());
        const updatedMember: MemberEntity = {
            ...member,
            password: hashedPassword,
        };
        await this.memberRepository.updateMember(updatedMember);
    }
}