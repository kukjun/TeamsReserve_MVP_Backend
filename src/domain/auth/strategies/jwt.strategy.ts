import {
    PassportStrategy,
} from "@nestjs/passport";
import {
    ExtractJwt,
    Strategy,
} from "passport-jwt";
import {
    ConfigService,
} from "@nestjs/config";
import {
    MemberToken,
} from "../../../interface/member-token";
import {
    MemberRepository,
} from "../../member/repository/member.repository";
import {
    MemberNotFoundException,
} from "../../../exception/member-not-found.exception";
import {
    Injectable, 
} from "@nestjs/common";

export const JWT_STRATEGY = "jwt-strategy";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
    constructor(
        readonly configService: ConfigService,
        private readonly memberRepository: MemberRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>("JWT_SECRET_KEY"),
        });
    }

    async validate(payload: MemberToken): Promise<MemberToken> {
        const member = await this.memberRepository.findMemberById(payload.id);
        if (!member) throw new MemberNotFoundException("id: " + payload.id);

        return {
            id: payload.id,
            nickname: payload.nickname,
            authority: payload.authority,
        };
    }
}