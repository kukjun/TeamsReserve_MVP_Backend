import * as nodemailer from "nodemailer";
import {
    Injectable,
} from "@nestjs/common";
import {
    ConfigService,
} from "@nestjs/config";
import {
    SentMessageInfo,
} from "nodemailer/lib/smtp-transport";

@Injectable()
export class EmailTransferService {
    constructor(
        private readonly transporter: nodemailer.Transporter<SentMessageInfo>,
        private readonly hostAccount: string,
        private readonly validateLimitTime: number,
        private readonly signupLimitTime: number,
        configService: ConfigService
    ) {
        this.hostAccount = configService.get<string>("EMAIL_ACCOUNT");
        this.transporter = nodemailer.createTransport({
            service: configService.get<string>("EMAIL_SERVICE_NAME"),
            auth: {
                user: hostAccount,
                pass: configService.get<string>("EMAIL_PASSWORD"),
            },
        });
        this.validateLimitTime = configService.get<number>("VALIDATE_LIMIT_TIME");
        this.signupLimitTime = configService.get<number>("SIGNUP_LIMIT_TIME");
    }

}