import {
    Body,
    Controller, Get, HttpCode, HttpStatus, Param, Patch, Put, Query, Request, UseGuards,
} from "@nestjs/common";
import {
    MemberService,
} from "./member.service";
import {
    ApiExtraModels, ApiOperation, ApiTags,
} from "@nestjs/swagger";
import {
    ApiDefaultResponse,
} from "../../util/decorators/api-default.response";
import {
    GetMemberResponseDto,
} from "./dto/res/get-member.response.dto";
import {
    DefaultResponse,
} from "../../interface/response/default.response";
import {
    Roles,
} from "../../util/decorators/permission";
import {
    MemberAuthority,
} from "../../types/enums/member.authority.enum";
import {
    PaginateRequestDto,
} from "../../interface/request/paginate.request.dto";
import {
    PaginateData,
} from "../../interface/response/paginate.data";
import {
    JwtGuard,
} from "../auth/guards/jwt.guard";
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

@ApiTags("members")
@ApiExtraModels(DefaultResponse)
@UseGuards(JwtGuard)
@Controller("members")
export class MemberController {
    constructor(private readonly memberService: MemberService) {
    }

    @Roles(MemberAuthority.USER, MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "멤버 Paginate 조회",
        description: "멤버의 정보를 Paginate 해서, 조회할 수 있다.",
    })
    @ApiDefaultResponse(PaginateData<GetMemberResponseDto>)
    @HttpCode(HttpStatus.OK)
    @Get()
    async getMemberList(@Query() paginateDto: PaginateRequestDto)
        : Promise<DefaultResponse<PaginateData<GetMemberResponseDto>>> {
        const data = await this.memberService.getMemberList(paginateDto);

        return new DefaultResponse(data);
    }

    @Roles(MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "멤버 Detail Paginate 조회",
        description: "멤버의 세부 정보(가입 여부, 권한)를 포함한 정보를 Paginate 해서, 조회할 수 있다.",
    })
    @ApiDefaultResponse(PaginateData<GetMemberDetailResponseDto>)
    @HttpCode(HttpStatus.OK)
    @Get("/detail")
    async getMemberDetailList(
        @Query() paginateDto: PaginateRequestDto,
        @Query() optionDto: MemberOptionDto
    )
        : Promise<DefaultResponse<PaginateData<GetMemberDetailResponseDto>>> {
        const data = await this.memberService.getMemberDetailList(paginateDto, optionDto);

        return new DefaultResponse(data);
    }

    @Roles(MemberAuthority.USER, MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "멤버 조회",
        description: "멤버의 정보를 조회할 수 있다.",
    })
    @ApiDefaultResponse(GetMemberResponseDto)
    @HttpCode(HttpStatus.OK)
    @Get("/:id")
    async getMember(@Param("id") id: string): Promise<DefaultResponse<GetMemberResponseDto>> {
        const data = await this.memberService.getMember(id);

        return new DefaultResponse(data);
    }

    @Roles(MemberAuthority.USER, MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "멤버 조회",
        description: "멤버의 정보를 조회할 수 있다.",
    })
    @ApiDefaultResponse(GetMemberResponseDto)
    @HttpCode(HttpStatus.OK)
    @Put("/:id")
    async updateMember(@Param("id") id: string,
                       @Body() requestBody: UpdateMemberRequestDto,
                       @Request() req
    )
        : Promise<DefaultResponse<UpdateMemberResponseDto>> {
        const data = await this.memberService.updateMember(id, requestBody, req.user);

        return new DefaultResponse(data);
    }

}