import {
    Injectable,
} from "@nestjs/common";
import {
    MemberRepository,
} from "./member.repository";
import {
    GetMemberResponseDto,
} from "./dto/res/get-member.response.dto";
import {
    MemberNotFoundException,
} from "../../exception/member-not-found.exception";

@Injectable()
export class MemberService {

    constructor(private readonly memberRepository: MemberRepository) {
    }

    async getMember(id: string): Promise<GetMemberResponseDto> {
        const member = await this.memberRepository.findMemberById(id);
        if (!member) throw new MemberNotFoundException(`id: ${id}`);

        return {
            id: member.id,
            email: member.email,
            nickname: member.nickname,
            teamCode: member.teamCode,
            introduce: member.introduce,
        };
    }

}