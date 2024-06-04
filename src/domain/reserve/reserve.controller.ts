import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Request, UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiExtraModels, ApiOperation, ApiTags,
} from "@nestjs/swagger";
import {
    CustomResponse,
} from "@root/interface/response/custom-response";
import {
    PaginateData, 
} from "@root/interface/response/paginate.data";
import {
    JwtGuard, 
} from "@auth/guards/jwt.guard";
import {
    ReserveService, 
} from "@reserve/reserve.service";
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
    CreateReserveResponseDto, 
} from "@reserve/dto/res/create-reserve.response.dto";
import {
    ReserveValidatePipe, 
} from "@reserve/pipes/reserve.validate.pipe";
import {
    CreateReserveValidateRequestDto, 
} from "@reserve/dto/req/create-reserve-validate.request.dto";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";
import {
    GetReserveResponseDto, 
} from "@reserve/dto/res/get-reserve.response.dto";
import {
    GetReserveLogResponseDto, 
} from "@reserve/dto/res/get-reserve-log.response.dto";
import {
    ReserveOptionDto, 
} from "@root/interface/request/reserve-option.dto";

@ApiTags("reserve")
@ApiExtraModels(CustomResponse)
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
    @PermissionDecorator(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @ApiCustomResponseDecorator(CreateReserveResponseDto)
    @Post()
    async createReserve(@Body(new ReserveValidatePipe()) requestBody: CreateReserveValidateRequestDto, @Request() req)
        : Promise<CustomResponse<CreateReserveResponseDto>> {
        const data = await this.reserveService.createReserve(requestBody, req.user);

        return new CustomResponse(data);
    }

    @ApiOperation({
        summary: "예약 삭제 API",
        description: "예약을 삭제할 수 있도록 하는 API",
    })
    @PermissionDecorator(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(":id")
    async deleteReserve(@Param("id") id: string, @Request() req)
        : Promise<CustomResponse<null>> {
        await this.reserveService.deleteReserve(id, req.user);

        return new CustomResponse(null);
    }

    @ApiOperation({
        summary: "My 예약 조회 List API",
        description: "본인이 예약한 정보를 Paginate된 예약List로 조회 할 수 있는 API",
    })
    @PermissionDecorator(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @ApiCustomResponseDecorator(PaginateData<GetReserveResponseDto>)
    @HttpCode(HttpStatus.OK)
    @Get("/my-reserve")
    async getMyReserveList(@Query() paginateDto: PaginateRequestDto, @Request() req)
        : Promise<CustomResponse<PaginateData<GetReserveResponseDto>>> {
        const data = await this.reserveService.getMyReserveList(paginateDto, req.user);

        return new CustomResponse(data);
    }

    @ApiOperation({
        summary: "예약 조회 Log List API",
        description: "모든 예약의 Paginate된 예약 Log 정보를 조회 할 수 있는 API",
    })
    @PermissionDecorator(MemberAuthority.ADMIN, MemberAuthority.MANAGER)
    @ApiCustomResponseDecorator(PaginateData<GetReserveLogResponseDto>)
    @HttpCode(HttpStatus.OK)
    @Get("/logs")
    async getReserveLogList(@Query() paginateDto: PaginateRequestDto)
        : Promise<CustomResponse<PaginateData<GetReserveLogResponseDto>>> {
        const data = await this.reserveService.getReserveLogList(paginateDto);

        return new CustomResponse(data);
    }

    @ApiOperation({
        summary: "예약 조회 API",
        description: "예약 단일 조회를 할 수 있는 API",
    })
    @ApiCustomResponseDecorator(GetReserveResponseDto)
    @PermissionDecorator(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @HttpCode(HttpStatus.OK)
    @Get(":id")
    async getReserve(@Param("id") id: string, @Request() req)
    : Promise<CustomResponse<GetReserveResponseDto>> {
        const data = await this.reserveService.getReserve(id, req.user);

        return new CustomResponse(data);
    }

    @ApiOperation({
        summary: "예약 조회List API",
        description: "SpaceId 별, Paginate된 예약List를 조회 할 수 있는 API",
    })
    @PermissionDecorator(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @ApiCustomResponseDecorator(PaginateData<GetReserveResponseDto>)
    @HttpCode(HttpStatus.OK)
    @Get()
    async getReserveList(@Query() paginateDto: PaginateRequestDto, @Query() optionDto: ReserveOptionDto)
        : Promise<CustomResponse<PaginateData<GetReserveResponseDto>>> {
        const data = await this.reserveService.getReserveList(paginateDto, optionDto);

        return new CustomResponse(data);
    }
}
