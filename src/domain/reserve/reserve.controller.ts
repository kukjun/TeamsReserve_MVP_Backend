import {
    Body, Controller, Post, Request, UseGuards, 
} from "@nestjs/common";
import {
    ReserveService, 
} from "./reserve.service";
import {
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

@ApiTags("reserve")
@ApiExtraModels(DefaultResponse)
@ApiExtraModels(PaginateData)
@UseGuards(JwtGuard)
@Controller("reserves")
export class ReserveController {
    constructor(private readonly reserveService: ReserveService) {
    }

    @ApiOperation({
        summary: "예약 API",
        description: "예약을 할 수 있도록 하는 API",
    })
    @Roles(MemberAuthority.ADMIN, MemberAuthority.MANAGER, MemberAuthority.USER)
    @Post()
    async createReserve(@Body(new ReserveValidatePipe()) requestBody: CreateReserveValidateRequestDto, @Request() req)
        : Promise<DefaultResponse<CreateReserveResponseDto>> {
        const data = await this.reserveService.createReserve(requestBody, req.user);

        return new DefaultResponse(data);
    }

}
