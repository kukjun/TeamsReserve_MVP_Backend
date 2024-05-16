import {
    Body, Controller, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards, UseInterceptors,
} from "@nestjs/common";
import {
    SpaceService,
} from "./space.service";
import {
    CreateSpaceRequestDto,
} from "./dto/req/create-space.request.dto";
import {
    DefaultResponse,
} from "../../interface/response/default.response";
import {
    CreateSpaceResponseDto,
} from "./dto/res/create-space.response.dto";
import {
    ApiExtraModels,
    ApiOperation, ApiTags,
} from "@nestjs/swagger";
import {
    ApiDefaultResponse,
} from "../../util/decorators/api-default.response";
import {
    Roles,
} from "../../util/decorators/permission";
import {
    MemberAuthority,
} from "../../types/enums/member.authority.enum";
import {
    JwtGuard,
} from "../auth/guards/jwt.guard";
import {
    FileInterceptor, 
} from "@nestjs/platform-express";
import {
    CreatePhotoResponseDto, 
} from "./dto/res/create-photo.response.dto";

@ApiTags("spaces")
@ApiExtraModels(DefaultResponse)
// @UseGuards(JwtGuard)
@Controller("spaces")
export class SpaceController {
    constructor(
        private readonly spaceService: SpaceService,
    ) {
    }

    // @Roles(MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "공간 생성",
        description: "공간을 생성할 수 있다.",
    })
    @HttpCode(HttpStatus.CREATED)
    @Post()
    @ApiDefaultResponse(CreateSpaceResponseDto)
    async createSpace(@Body() requestBody: CreateSpaceRequestDto): Promise<DefaultResponse<CreateSpaceResponseDto>> {
        const data = await this.spaceService.createSpace(requestBody);

        return new DefaultResponse(data);
    }

    // @Roles(MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @Post("/:id/photo")
    @UseInterceptors(FileInterceptor("file"))
    async createSpacePhoto(@Param("id") id: string, @UploadedFile() file: Express.Multer.File)
    : Promise<DefaultResponse<CreatePhotoResponseDto>> {
        const data = await this.spaceService.createPhoto(id, file);

        return new DefaultResponse(data);
    }
}