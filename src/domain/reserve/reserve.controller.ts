import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Request, UseGuards,
} from "@nestjs/common";
import {
    ReserveService,
} from "./reserve.service";
import {
    ApiBearerAuth,
    ApiExtraModels, ApiOperation, ApiTags,
} from "@nestjs/swagger";
import {
    DefaultResponse,
} from "../../interface/response/default.response";
import {
    PaginateData,
} from "../../interface/response/paginate.data";
import {
    JwtGuard,
} from "../auth/guards/jwt.guard";
import {
    CreateReserveValidateRequestDto,
} from "./dto/req/create-reserve-validate.request.dto";
import {
    CreateReserveResponseDto,
} from "./dto/res/create-reserve.response.dto";
import {
    ReserveValidatePipe,
} from "./pipes/reserve.validate.pipe";
import {
    Roles,
} from "../../util/decorators/permission";
import {
    MemberAuthority,
} from "../../types/enums/member.authority.enum";
import {
    ApiDefaultResponse, 
} from "../../util/decorators/api-default.response";
import {
    PaginateRequestDto, 
} from "../../interface/request/paginate.request.dto";
import {
    GetReserveResponseDto, 
} from "./dto/res/get-reserve.response.dto";
import {
    ReserveOptionDto, 
} from "../../interface/request/reserve-option.dto";
import {
    GetReserveLogResponseDto, 
} from "./dto/res/get-reserve-log.response.dto";

@ApiTags("reserve")
@ApiExtraModels(DefaultResponse)
@ApiExtraModels(PaginateData)
@UseGuards(JwtGuard)
@ApiBearerAuth("token")
@Controller("reserves")
export class ReserveController {
    constructor(private readonly reserveService: ReserveService) {
    }

    @ApiOperation({
        summary: "예약 API",
        description: "예약을 할 수 있도록 하는 API",
    })
    @Roles(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @ApiDefaultResponse(CreateReserveResponseDto)
    @Post()
    async createReserve(@Body(new ReserveValidatePipe()) requestBody: CreateReserveValidateRequestDto, @Request() req)
        : Promise<DefaultResponse<CreateReserveResponseDto>> {
        const data = await this.reserveService.createReserve(requestBody, req.user);

        return new DefaultResponse(data);
    }

    @ApiOperation({
        summary: "예약 삭제 API",
        description: "예약을 삭제할 수 있도록 하는 API",
    })
    @Roles(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(":id")
    async deleteReserve(@Param("id") id: string, @Request() req)
        : Promise<DefaultResponse<null>> {
        await this.reserveService.deleteReserve(id, req.user);

        return new DefaultResponse(null);
    }

    @ApiOperation({
        summary: "My 예약 조회 List API",
        description: "본인이 예약한 정보를 Paginate된 예약List로 조회 할 수 있는 API",
    })
    @Roles(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @HttpCode(HttpStatus.OK)
    @Get("/my-reserve")
    async getMyReserveList(@Query() paginateDto: PaginateRequestDto, @Request() req)
        : Promise<DefaultResponse<PaginateData<GetReserveResponseDto>>> {
        const data = await this.reserveService.getMyReserveList(paginateDto, req.user);

        return new DefaultResponse(data);
    }

    @ApiOperation({
        summary: "예약 조회 Log List API",
        description: "모든 예약의 Paginate된 예약 Log 정보를 조회 할 수 있는 API",
    })
    @Roles(MemberAuthority.ADMIN, MemberAuthority.MANAGER)
    @HttpCode(HttpStatus.OK)
    @Get("/logs")
    async getReserveLogList(@Query() paginateDto: PaginateRequestDto)
        : Promise<DefaultResponse<PaginateData<GetReserveLogResponseDto>>> {
        const data = await this.reserveService.getReserveLogList(paginateDto);

        return new DefaultResponse(data);
    }

    @ApiOperation({
        summary: "예약 조회 API",
        description: "예약 단일 조회를 할 수 있는 API",
    })
    @Roles(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @HttpCode(HttpStatus.OK)
    @Get(":id")
    async getReserve(@Param("id") id: string, @Request() req)
    : Promise<DefaultResponse<GetReserveResponseDto>> {
        const data = await this.reserveService.getReserve(id, req.user);

        return new DefaultResponse(data);
    }

    @ApiOperation({
        summary: "예약 조회List API",
        description: "SpaceId 별, Paginate된 예약List를 조회 할 수 있는 API",
    })
    @Roles(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @HttpCode(HttpStatus.OK)
    @Get()
    async getReserveList(@Query() paginateDto: PaginateRequestDto, @Query() optionDto: ReserveOptionDto)
        : Promise<DefaultResponse<PaginateData<GetReserveResponseDto>>> {
        const data = await this.reserveService.getReserveList(paginateDto, optionDto);

        return new DefaultResponse(data);
    }
}
