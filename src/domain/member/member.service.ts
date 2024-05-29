import {
    Injectable,
} from "@nestjs/common";
import {
    MemberRepository,
} from "@member/member.repository";
import {
    GetMemberResponseDto,
} from "@member/dto/res/get-member.response.dto";
import {
    MemberNotFoundException,
} from "@root/exception/member-not-found.exception";
import {
    PaginateRequestDto,
} from "@root/interface/request/paginate.request.dto";
import {
    PaginateData,
} from "@root/interface/response/paginate.data";
import {
    MemberOptionDto,
} from "@root/interface/request/member-option.dto";
import {
    GetMemberDetailResponseDto,
} from "@member/dto/res/get-member-detail.response.dto";
import {
    UpdateMemberRequestDto,
} from "@member/dto/req/update-member.request.dto";
import {
    MemberToken,
} from "@root/interface/member-token";
import {
    UpdateMemberResponseDto,
} from "@member/dto/res/update-member.response.dto";
import {
    ResourceUnauthorizedException,
} from "@root/exception/resource-unauthorized.exception";
import {
    DuplicateException,
} from "@root/exception/duplicate.exception";
import {
    MemberEntity,
} from "@member/entity/member.entity";
import {
    UpdateMemberPasswordRequestDto,
} from "@member/dto/req/update-member-password.request.dto";
import {
    bcryptFunction,
} from "@root/util/function/bcrypt.function";
import {
    PasswordIncorrectException,
} from "@root/exception/password-incorrect.exception";
import {
    UpdateMemberJoinStatusRequestDto,
} from "@member/dto/req/update-member-join-status-request.dto";
import {
    UpdateMemberAuthorityRequestDto,
} from "@member/dto/req/update-member-authority.request.dto";
import {
    BadRequestException,
} from "@root/exception/http/bad-request.exception";
import {
    MemberAuthority,
} from "@root/types/enums/member.authority.enum";

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

    async updateMemberJoinStatus(id: string, dto: UpdateMemberJoinStatusRequestDto, token: MemberToken)
        : Promise<UpdateMemberResponseDto> {
        const member = await this.memberRepository.findMemberById(id);
        if (!member) throw new MemberNotFoundException(`id: ${id}`);
        if (member.joinStatus === true) throw new BadRequestException("already join");

        if (dto.joinStatus === false) await this.memberRepository.deleteMember(id);
        else {
            const updatedMember: MemberEntity = {
                ...member,
                joinStatus: true,
            };
            await this.memberRepository.updateMember(updatedMember);
        }

        return {
            id,
        };
    }

    async updateMemberAuthority(id: string, dto: UpdateMemberAuthorityRequestDto, token: MemberToken)
        : Promise<UpdateMemberResponseDto> {
        const member = await this.memberRepository.findMemberById(id);
        if (!member) throw new MemberNotFoundException(`id: ${id}`);
        if (member.joinStatus !== true) throw new BadRequestException("not join");
        if (member.authority === MemberAuthority.ADMIN) throw new BadRequestException("Admin Member Can't Change");

        const updatedMember: MemberEntity = {
            ...member,
            authority: dto.authority,
        };
        const resultId = await this.memberRepository.updateMember(updatedMember);

        return {
            id: resultId,
        };
    }

    async deleteMember(id: string, token: MemberToken): Promise<null> {
        if (id !== token.id) throw new ResourceUnauthorizedException();
        const member = await this.memberRepository.findMemberById(id);
        if (!member) throw new MemberNotFoundException(`id: ${id}`);

        await this.memberRepository.deleteMember(member.id);

        return null;
    }

}