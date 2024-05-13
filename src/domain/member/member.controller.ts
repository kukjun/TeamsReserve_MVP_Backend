import {
    Controller, Get, HttpCode, HttpStatus, Param, UseGuards, 
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
} from "../../response/default.response";
import {
    JwtGuard, 
} from "../auth/guards/jwt.guard";
import {
    Roles, 
} from "../../util/decorators/permission";
import {
    MemberAuthority, 
} from "../../types/enums/member.authority.enum";

@ApiTags("members")
@ApiExtraModels(DefaultResponse)
@UseGuards(JwtGuard)
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

}