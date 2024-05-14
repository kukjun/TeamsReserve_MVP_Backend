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
import {
    PaginateRequestDto,
} from "../../interface/request/paginate.request.dto";
import {
    PaginateData,
} from "../../interface/response/paginate.data";

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

    async getMemberList(paginateDto: PaginateRequestDto): Promise<PaginateData<GetMemberResponseDto>> {
        const members = await this.memberRepository.findMemberByPaging(paginateDto);
        const data: GetMemberResponseDto[] = members.map(member => {
            return {
                id: member.id,
                email: member.email,
                nickname: member.nickname,
                teamCode: member.teamCode,
                introduce: member.introduce,
            };
        });
        const totalCount = await this.memberRepository.findMemberCount();
        const totalPage = Math.ceil(totalCount / paginateDto.limit);
        const hasNextPage = paginateDto.page < totalPage;

        return {
            data: data,
            meta: {
                page: paginateDto.page,
                take: paginateDto.limit,
                totalCount,
                totalPage,
                hasNextPage,
            },
        };
    }

}