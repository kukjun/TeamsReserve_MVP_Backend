import * as bcrypt from "bcrypt";
import {
    Injectable,
} from "@nestjs/common";
import {
    InjectRedis,
} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {
    JwtService, 
} from "@nestjs/jwt";
import {
    ConfigService, 
} from "@nestjs/config";
import {
    MemberRepository, 
} from "@member/member.repository";
import {
    SignupRequest, 
} from "@auth/dto/req/signup.request";
import {
    SignupResponse, 
} from "@auth/dto/res/signup.response";
import {
    EmailUnauthenticatedException, 
} from "@root/exception/email-unauthenticated.exception";
import {
    TeamUnauthenticatedException, 
} from "@root/exception/team-unauthenticated.exception";
import {
    DuplicateException, 
} from "@root/exception/duplicate.exception";
import {
    MemberEntity, 
} from "@member/entity/member.entity";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";
import {
    SigninRequest, 
} from "@auth/dto/req/signin.request";
import {
    SigninFailException, 
} from "@root/exception/signin-fail.exception";
import {
    SigninResponse, 
} from "@auth/dto/res/signin.response";
import {
    MemberToken, 
} from "@root/interface/member-token";

@Injectable()
export class AuthService {
    private readonly secret: string;
    private readonly teamCode: string;
    constructor(
        @InjectRedis() private readonly client: Redis,
        private readonly memberRepository: MemberRepository,
        private readonly jwtService: JwtService,
        configService: ConfigService,
    ) {
        this.secret = configService.get<string>("JWT_SECRET_KEY");
        this.teamCode = configService.get<string>("TEAM_CODE") ?? "TEAM_CODE";
    }

    async signup(request: SignupRequest): Promise<SignupResponse> {
        const validate = await this.client.get(request.email);
        if(validate === null || validate !== "validate") throw new EmailUnauthenticatedException();

        if(request.teamCode !== this.teamCode) throw new TeamUnauthenticatedException();

        const memberByEmail = await this.memberRepository.findMemberByEmail(request.email);
        if (memberByEmail !== null) throw new DuplicateException("email: " + request.email + " duplicate");

        const memberByNickname = await this.memberRepository.findMemberByNickname(request.nickname);
        if (memberByNickname !== null) throw new DuplicateException("nickname: " + request.nickname + " duplicate");

        // 생성
        const hashedPassword = await bcrypt.hash(request.password, await bcrypt.genSalt());
        const updatedRequest: SignupRequest = {
            email: request.email,
            password: hashedPassword,
            nickname: request.nickname,
            teamCode: request.teamCode,
            introduce: request?.introduce,
        };

        const memberEntity = new MemberEntity(updatedRequest);
        memberEntity.authority = MemberAuthority.USER;
        const result = await this.memberRepository.saveMember(memberEntity);

        return {
            id: result,
        };
    }
    async validateSignin(request: SigninRequest): Promise<string> {
        const member = await this.memberRepository.findMemberByEmail(request.email);
        if(!member || member.joinStatus === false) throw new SigninFailException();
        if(!await bcrypt.compare(request.password, member.password)) throw new SigninFailException();

        return member.id;
    }
    async signin(id: string): Promise<SigninResponse> {
        const member = await this.memberRepository.findMemberById(id);
        const payload: MemberToken = {
            id: member.id,
            nickname: member.nickname,
            authority: member.authority,
        };
        const token = this.jwtService.sign(payload, {
            secret: this.secret,
        });

        return {
            accessToken: token,
        };

    }

}