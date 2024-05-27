import {
    Body,
    Controller, Delete,
    FileTypeValidator,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipe,
    Post, Put, Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiExtraModels, ApiOperation, ApiTags,
} from "@nestjs/swagger";
import {
    FileInterceptor,
} from "@nestjs/platform-express";
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
    SpaceService, 
} from "@space/space.service";
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
    CreateSpaceResponseDto, 
} from "@space/dto/res/create-space.response.dto";
import {
    CreateSpaceRequestDto, 
} from "@space/dto/req/create-space.request.dto";
import {
    CreatePhotoResponseDto, 
} from "@space/dto/res/create-photo.response.dto";
import {
    GetPhotoListResponseDto, 
} from "@space/dto/res/get-photo-list-response.dto";
import {
    UpdateSpaceRequestDto, 
} from "@space/dto/req/update-space.request.dto";
import {
    GetSpaceResponseDto, 
} from "@space/dto/res/get-space.response.dto";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";

@ApiTags("spaces")
@ApiExtraModels(CustomResponse)
@ApiExtraModels(PaginateData)
@UseGuards(JwtGuard)
@ApiBearerAuth("token")
@Controller("spaces")
export class SpaceController {
    constructor(
        private readonly spaceService: SpaceService
    ) {
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "공간 생성",
        description: "공간을 생성할 수 있다.",
    })
    @ApiCustomResponseDecorator(CreateSpaceResponseDto)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async createSpace(@Body() requestBody: CreateSpaceRequestDto): Promise<CustomResponse<CreateSpaceResponseDto>> {
        const data = await this.spaceService.createSpace(requestBody);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "공간 사진 생성.",
        description: "공간에 사진을 저장할 수 있다.",
    })
    @ApiCustomResponseDecorator(CreatePhotoResponseDto)
    @HttpCode(HttpStatus.CREATED)
    @Post("/:id/photos")
    @UseInterceptors(FileInterceptor("file"))
    async createSpacePhoto(@Param("id") id: string, @UploadedFile(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({
                    fileType: ".(png|jpeg|jpg)",
                }),
            ],
        })
    ) file: Express.Multer.File)
        : Promise<CustomResponse<CreatePhotoResponseDto>> {
        const data = await this.spaceService.createPhoto(id, file);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN, MemberAuthority.USER)
    @ApiOperation({
        summary: "공간 사진 조회.",
        description: "공간에 저장된 사진을 조회할 수 있다.",
    })
    @ApiCustomResponseDecorator(GetPhotoListResponseDto)
    @HttpCode(HttpStatus.OK)
    @Get("/:id/photos")
    async getPhotoList(@Param("id") id: string): Promise<CustomResponse<GetPhotoListResponseDto>> {
        const data = await this.spaceService.getPhotoList(id);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN, MemberAuthority.USER)
    @ApiOperation({
        summary: "공간 사진 삭제.",
        description: "공간에 저장된 사진을 삭제할 수 있다.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete("/:id/photos/:photoId")
    async deletePhoto(@Param("id") id: string, @Param("photoId") photoId: string): Promise<CustomResponse<null>> {
        await this.spaceService.deletePhoto(id, photoId);

        return new CustomResponse(null);
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN, MemberAuthority.USER)
    @ApiOperation({
        summary: "공간 수정.",
        description: "공간의 내용을 수정할 수 있다.",
    })
    @ApiCustomResponseDecorator(PaginateData<CreateSpaceResponseDto>)
    @HttpCode(HttpStatus.CREATED)
    @Put("/:id")
    async updateSpace(@Param("id") id: string, @Body() requestBody: UpdateSpaceRequestDto)
        : Promise<CustomResponse<CreateSpaceResponseDto>> {
        const data = await this.spaceService.updateSpace(id, requestBody);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN)
    @ApiOperation({
        summary: "공간 삭제.",
        description: "생성된 공간을 삭제할 수 있다.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete("/:id")
    async deleteSpace(@Param("id") id: string)
        : Promise<CustomResponse<null>> {
        await this.spaceService.deleteSpace(id);

        return new CustomResponse(null);
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN, MemberAuthority.USER)
    @ApiOperation({
        summary: "공간 조회.",
        description: "공간의 정보를 조회할 수 있다.",
    })
    @ApiCustomResponseDecorator(GetPhotoListResponseDto)
    @HttpCode(HttpStatus.OK)
    @Get("/:id")
    async getSpace(@Param("id") id: string): Promise<CustomResponse<GetSpaceResponseDto>> {
        const data = await this.spaceService.getSpace(id);

        return new CustomResponse(data);
    }

    @PermissionDecorator(MemberAuthority.MANAGER, MemberAuthority.ADMIN, MemberAuthority.USER)
    @ApiOperation({
        summary: "공간 List 조회.",
        description: "공간의 정보를 Paginate해서 조회할 수 있다.",
    })
    @ApiCustomResponseDecorator(PaginateData<GetSpaceResponseDto>)
    @HttpCode(HttpStatus.OK)
    @Get()
    async getSpaceList(@Query() paginateDto: PaginateRequestDto)
        : Promise<CustomResponse<PaginateData<GetSpaceResponseDto>>> {
        const data = await this.spaceService.getSpaceList(paginateDto);

        return new CustomResponse(data);
    }

}