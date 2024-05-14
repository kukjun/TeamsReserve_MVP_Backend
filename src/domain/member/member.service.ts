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
import {
    GetMemberDetailResponseDto,
} from "./dto/res/get-member-detail.response.dto";
import {
    MemberOptionDto,
} from "../../interface/request/member-option.dto";
import {
    UpdateMemberRequestDto,
} from "./dto/req/update-member.request.dto";
import {
    UpdateMemberResponseDto,
} from "./dto/res/update-member.response.dto";
import {
    MemberToken,
} from "../../interface/member-token";
import {
    ResourceUnauthorizedException,
} from "../../exception/resource-unauthorized.exception";
import {
    MemberEntity,
} from "./entity/member.entity";
import {
    DuplicateException,
} from "../../exception/duplicate.exception";
import {
    UpdateMemberPasswordRequestDto,
} from "./dto/req/update-member-password.request.dto";
import {
    bcryptFunction,
} from "../../util/function/bcrypt.function";
import {
    PasswordIncorrectException, 
} from "../../exception/password-incorrect.exception";

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

    async getMemberDetailList(paginateDto: PaginateRequestDto, optionDto: MemberOptionDto)
        : Promise<PaginateData<GetMemberDetailResponseDto>> {
        const members = await this.memberRepository.findMemberByPaging(paginateDto, optionDto);
        const data: GetMemberDetailResponseDto[] = members.map(member => {
            return {
                id: member.id,
                email: member.email,
                nickname: member.nickname,
                teamCode: member.teamCode,
                introduce: member.introduce,
                authority: member.authority,
                joinStatus: member.joinStatus,
            };
        });
        const totalCount = await this.memberRepository.findMemberCount(optionDto);
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

    async updateMember(id: string, updateDto: UpdateMemberRequestDto, token: MemberToken)
        : Promise<UpdateMemberResponseDto> {
        if (id !== token.id) throw new ResourceUnauthorizedException();
        const member = await this.memberRepository.findMemberById(id);
        if (!member) throw new MemberNotFoundException(`id: ${id}`);

        const nicknameDuplicateMember = await this.memberRepository.findMemberByNickname(updateDto.nickname);
        if (nicknameDuplicateMember) throw new DuplicateException(`nickname: ${updateDto.nickname}`);

        const updatedMember: MemberEntity = {
            ...member,
            ...updateDto,
        };

        const resultId = await this.memberRepository.updateMember(updatedMember);

        return {
            id: resultId,
        };
    }

    async updateMemberPassword(id: string, dto: UpdateMemberPasswordRequestDto, token: MemberToken)
        : Promise<UpdateMemberResponseDto> {
        if (id !== token.id) throw new ResourceUnauthorizedException();
        const member = await this.memberRepository.findMemberById(id);
        if (!member) throw new MemberNotFoundException(`id: ${id}`);
        if (!await bcryptFunction.compare(dto.currentPassword, member.password)) throw new PasswordIncorrectException();

        const encryptPassword = await bcryptFunction.hash(dto.newPassword, await bcryptFunction.genSalt());
        const updatedMember: MemberEntity = {
            ...member,
            password: encryptPassword,
        };

        const resultId = await this.memberRepository.updateMember(updatedMember);

        return {
            id: resultId,
        };
    }

}