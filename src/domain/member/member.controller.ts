import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Put,
    Query,
    Request,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiExtraModels, ApiOperation, ApiTags,
} from "@nestjs/swagger";
import {
    MemberService, 
} from "@member/member.service";
import {
    CustomResponse,
} from "@root/interface/response/custom-response";
import {
    JwtGuard, 
} from "@auth/guards/jwt.guard";
import {
    PermissionDecorator,
} from "@root/util/decorators/permission.decorator";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";
import {
    ApiCustomResponseDecorator,
} from "@root/util/decorators/api-custom-response.decorator";
import {
    PaginateData, 
} from "@root/interface/response/paginate.data";
import {
    GetMemberResponseDto, 
} from "@member/dto/res/get-member.response.dto";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";
import {
    GetMemberDetailResponseDto, 
} from "@member/dto/res/get-member-detail.response.dto";
import {
    MemberOptionDto, 
} from "@root/interface/request/member-option.dto";
import {
    UpdateMemberRequestDto, 
} from "@member/dto/req/update-member.request.dto";
import {
    UpdateMemberResponseDto, 
} from "@member/dto/res/update-member.response.dto";
import {
    UpdateMemberPasswordRequestDto, 
} from "@member/dto/req/update-member-password.request.dto";
import {
    UpdateMemberJoinStatusRequestDto, 
} from "@member/dto/req/update-member-join-status-request.dto";
import {
    UpdateMemberAuthorityRequestDto, 
} from "@member/dto/req/update-member-authority.request.dto";
import {
    ApiCustomFilterResponseDecorator, 
} from "@root/util/api-custom-filter-response.decotrator";

@ApiTags("members")
@ApiExtraModels(CustomResponse)
@UseGuards(JwtGuard)
@ApiBearerAuth("token")
@Controller("members")
export class MemberController {
    constructor(private readonly memberService: MemberService) {
    }

    @PermissionDecorator(MemberAuthority.USER, MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "멤버 Paginate 조회",
        description: "멤버의 정보를 Paginate 해서, 조회할 수 있다.",
    })
    @ApiCustomFilterResponseDecorator(GetMemberResponseDto)
    @HttpCode(HttpStatus.OK)
    @Get()
    async getMemberList(@Query() paginateDto: PaginateRequestDto)
        : Promise<CustomResponse<PaginateData<GetMemberResponseDto>>> {
        const data = await this.memberService.getMemberList(paginateDto);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "멤버 Detail Paginate 조회",
        description: "멤버의 세부 정보(가입 여부, 권한)를 포함한 정보를 Paginate 해서, 조회할 수 있다.",
    })
    @ApiCustomFilterResponseDecorator(GetMemberDetailResponseDto)
    @HttpCode(HttpStatus.OK)
    @Get("/detail")
    async getMemberDetailList(
        @Query() paginateDto: PaginateRequestDto,
        @Query() optionDto: MemberOptionDto
    )
        : Promise<CustomResponse<PaginateData<GetMemberDetailResponseDto>>> {
        const data = await this.memberService.getMemberDetailList(paginateDto, optionDto);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.USER, MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "멤버 조회",
        description: "멤버의 정보를 조회할 수 있다.",
    })
    @ApiCustomResponseDecorator(GetMemberResponseDto)
    @HttpCode(HttpStatus.OK)
    @Get("/:id")
    async getMember(@Param("id") id: string): Promise<CustomResponse<GetMemberResponseDto>> {
        const data = await this.memberService.getMember(id);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.USER, MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "정보 수정",
        description: "자신의 정보를 수정할 수 있다.",
    })
    @ApiCustomResponseDecorator(GetMemberResponseDto)
    @HttpCode(HttpStatus.CREATED)
    @Put("/:id")
    async updateMember(@Param("id") id: string,
                       @Body() requestBody: UpdateMemberRequestDto,
                       @Request() req
    )
        : Promise<CustomResponse<UpdateMemberResponseDto>> {
        const data = await this.memberService.updateMember(id, requestBody, req.user);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.USER, MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "비밀번호 변경",
        description: "자신의 비밀번호를 변경할 수 있다.",
    })
    @ApiCustomResponseDecorator(GetMemberResponseDto)
    @HttpCode(HttpStatus.CREATED)
    @Patch("/:id/password")
    async updateMemberPassword(@Param("id") id: string,
                               @Body() requestBody: UpdateMemberPasswordRequestDto,
                               @Request() req
    )
        : Promise<CustomResponse<UpdateMemberResponseDto>> {
        const data = await this.memberService.updateMemberPassword(id, requestBody, req.user);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.ADMIN, MemberAuthority.MANAGER)
    @ApiOperation({
        summary: "회원가입 승인, 취소",
        description: "회원가입 요청이 있는 회원의 가입 승인, 취소할 수 있다.",
    })
    @ApiCustomResponseDecorator(GetMemberResponseDto)
    @HttpCode(HttpStatus.CREATED)
    @Patch("/:id/join")
    async updateMemberJoinStatus(@Param("id") id: string,
                                 @Body() requestBody: UpdateMemberJoinStatusRequestDto,
                                 @Request() req)
        : Promise<CustomResponse<UpdateMemberResponseDto>> {
        const data = await this.memberService.updateMemberJoinStatus(id, requestBody, req.user);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "회원 권한 부여",
        description: "회원가입 한 회원에게 권한을 부여할 수 있다.",
    })
    @ApiCustomResponseDecorator(GetMemberResponseDto)
    @HttpCode(HttpStatus.CREATED)
    @Patch("/:id/authority")
    async updateMemberAuthority(@Param("id") id: string,
                                @Body() requestBody: UpdateMemberAuthorityRequestDto,
                                @Request() req)
        : Promise<CustomResponse<UpdateMemberResponseDto>> {
        const data = await this.memberService.updateMemberAuthority(id, requestBody, req.user);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @ApiOperation({
        summary: "회원 탈퇴",
        description: "본인이 자신 스스로 탈퇴할 수 있다.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete("/:id")
    async deleteMember(@Param("id") id: string,
                       @Request() req)
        : Promise<CustomResponse<null>> {
        await this.memberService.deleteMember(id, req.user);

        return null;
    }

}