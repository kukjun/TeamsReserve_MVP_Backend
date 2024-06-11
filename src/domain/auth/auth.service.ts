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
import {
    bcryptFunction, 
} from "@root/util/function/bcrypt.function";
import {
    MemberNotFoundException, 
} from "@root/exception/member-not-found.exception";

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
        this.secret = configService.get<string>("JWT_SECRET_KEY") ?? "SECRET";
        this.teamCode = configService.get<string>("TEAM_CODE") ?? "TEAM_CODE";
    }

    async signup(request: SignupRequest): Promise<SignupResponse> {
        await this.validateSignup(request);
        const result = await this.createUser(request);

        return {
            id: result,
        };
    }

    private async validateSignup(dto: SignupRequest) {
        const validate = await this.client.get(dto.email);
        if(validate === null || validate !== "validate") throw new EmailUnauthenticatedException();
        if(dto.teamCode !== this.teamCode) throw new TeamUnauthenticatedException();
        const memberByEmail = await this.memberRepository.findMemberByEmail(dto.email);
        if (memberByEmail !== null) throw new DuplicateException("email: " + dto.email);
        const memberByNickname = await this.memberRepository.findMemberByNickname(dto.nickname);
        if (memberByNickname !== null) throw new DuplicateException("nickname: " + dto.nickname);
    }

    private async createUser(dto: SignupRequest): Promise<string> {
        const hashedPassword = await bcryptFunction.hash(dto.password, await bcryptFunction.genSalt());
        const updatedRequest: SignupRequest = {
            email: dto.email,
            password: hashedPassword,
            nickname: dto.nickname,
            teamCode: dto.teamCode,
            introduce: dto?.introduce,
        };
        const memberEntity = new MemberEntity(updatedRequest);
        memberEntity.authority = MemberAuthority.USER;

        return await this.memberRepository.saveMember(memberEntity);
    }
    async validateSignin(request: SigninRequest): Promise<string> {
        const member = await this.memberRepository.findMemberByEmail(request.email);
        if(!member || member.joinStatus === false) throw new SigninFailException();
        if(!await bcryptFunction.compare(request.password, member.password)) throw new SigninFailException();

        return member.id;
    }
    async signin(id: string): Promise<SigninResponse> {
        const member = await this.memberRepository.findMemberById(id);
        if(member == null) throw new MemberNotFoundException(`id: ${id}`);
        const token = this.transferMemberToToken(member);

        return {
            accessToken: token,
        };
    }

    private transferMemberToToken(member: MemberEntity): string {
        const payload: MemberToken = {
            id: member.id,
            nickname: member.nickname,
            authority: member.authority,
        };

        return this.jwtService.sign(payload, {
            secret: this.secret,
        });
    }

}