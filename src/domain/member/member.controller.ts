import {
    Controller, Get, HttpCode, HttpStatus, Param, Query,
} from "@nestjs/common";
import {
    MemberService,
} from "./member.service";
import {
    ApiExtraModels,
    ApiOperation, ApiTags,
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

@ApiTags("members")
@ApiExtraModels(DefaultResponse)
// @UseGuards(JwtGuard)
@Controller("members")
export class MemberController {
    constructor(private readonly memberService: MemberService) {
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

    // @Roles(MemberAuthority.USER, MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "멤버 Paginate 조회",
        description: "멤버의 정보를 Paginate 해서, 조회할 수 있다.",
    })
    @ApiDefaultResponse(GetMemberResponseDto)
    @HttpCode(HttpStatus.OK)
    @Get()
    async getMemberList(@Query() paginateDto: PaginateRequestDto)
        : Promise<DefaultResponse<PaginateData<GetMemberResponseDto>>> {
        const data = await this.memberService.getMemberList(paginateDto);

        return new DefaultResponse(data);
    }

}