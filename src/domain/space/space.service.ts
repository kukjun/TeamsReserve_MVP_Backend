import {
    Injectable,
} from "@nestjs/common";
import {
    ConfigService,
} from "@nestjs/config";
import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import {
    SpaceRepository,
} from "@space/space.repository";
import {
    PhotoRepository,
} from "@space/photo.repository";
import {
    CreateSpaceRequestDto,
} from "@space/dto/req/create-space.request.dto";
import {
    CreateSpaceResponseDto,
} from "@space/dto/res/create-space.response.dto";
import {
    DuplicateException,
} from "@root/exception/duplicate.exception";
import {
    SpaceEntity,
} from "@space/entity/space.entity";
import {
    CreatePhotoResponseDto,
} from "@space/dto/res/create-photo.response.dto";
import {
    SpaceNotFoundException,
} from "@root/exception/space-not-found.exception";
import {
    uuidFunction,
} from "@root/util/function/uuid.function";
import {
    PhotoEntity,
} from "@space/entity/photo.entity";
import {
    GetPhotoListResponseDto,
} from "@space/dto/res/get-photo-list-response.dto";
import {
    GetPhotoResponseDto,
} from "@space/dto/res/get-photo-response.dto";
import {
    PhotoNotFoundException,
} from "@root/exception/photo-not-found.exception";
import {
    GetSpaceResponseDto,
} from "@space/dto/res/get-space.response.dto";
import {
    PaginateRequestDto,
} from "@root/interface/request/paginate.request.dto";
import {
    PaginateData,
} from "@root/interface/response/paginate.data";
import {
    UpdateSpaceRequestDto,
} from "@space/dto/req/update-space.request.dto";

@Injectable()
export class SpaceService {
    s3Client: S3Client;

    constructor(
        private readonly configService: ConfigService,
        private readonly spaceRepository: SpaceRepository,
        private readonly photoRepository: PhotoRepository
    ) {
        this.s3Client = new S3Client({
            region: this.configService.get("AWS_REGION"),
            credentials: {
                accessKeyId: this.configService.get("AWS_ACCESS_KEY"),
                secretAccessKey: this.configService.get("AWS_SECRET_KEY"),
            },
        });
    }

    async createSpace(dto: CreateSpaceRequestDto): Promise<CreateSpaceResponseDto> {
        const space = await this.spaceRepository.findSpaceByName(dto.name);
        if (space) throw new DuplicateException(`name: ${dto.name} space`);

        const newSpace = new SpaceEntity(dto);

        const resultId = await this.spaceRepository.saveSpace(newSpace);

        return {
            id: resultId,
        };
    }

    async createPhoto(id: string, file: Express.Multer.File): Promise<CreatePhotoResponseDto> {
        const space = await this.spaceRepository.findSpaceById(id);
        if (!space) throw new SpaceNotFoundException(`id: ${id}`);

        const {
            fileId, filePath,
        } = await this.savePhoto(id, file);

        const photoEntity: PhotoEntity = new PhotoEntity({
            id: fileId,
            path: filePath,
            name: file.originalname,
            spaceId: space.id,
        });
        const resultId = await this.photoRepository.save(photoEntity);

        return {
            id: resultId,
        };
    }

    async getPhotoList(id: string): Promise<GetPhotoListResponseDto> {
        const space = await this.spaceRepository.findSpaceById(id);
        if (!space) throw new SpaceNotFoundException(`id: ${id}`);

        const photoList = await this.photoRepository.findPhotoListBySpaceId(id);
        const result: GetPhotoResponseDto[] = photoList.map(photo => {
            return {
                id: photo.id,
                path: photo.path,
                name: photo.name,
            };
        });

        return {
            data: result,
        };
    }

    async deletePhoto(id: string, photoId: string): Promise<null> {
        const space = await this.spaceRepository.findSpaceById(id);
        if (!space) throw new SpaceNotFoundException(`id: ${id}`);

        const photo = await this.photoRepository.findPhotoById(photoId);
        if (!photo) throw new PhotoNotFoundException(`id: ${id}`);

        const fileKey = `${this.configService.get("AWS_BUCKET_KEY_ENV")}/spaces/${id}/photos/${photoId}`;
        const command = new DeleteObjectCommand({
            Bucket: this.configService.get("AWS_BUCKET_NAME"),
            Key: fileKey,
        });
        await this.s3Client.send(command);

        await this.photoRepository.deletePhotoById(photoId);

        return null;
    }

    async getSpace(id: string): Promise<GetSpaceResponseDto> {
        const space = await this.spaceRepository.findSpaceById(id);
        if (!space) throw new SpaceNotFoundException(`id: ${id}`);

        return {
            id: space.id,
            name: space.name,
            location: space.location,
            description: space.description,
        };
    }

    async getSpaceList(paginateDto: PaginateRequestDto): Promise<PaginateData<GetSpaceResponseDto>> {
        const spaces = await this.spaceRepository.findSpaceByPaging(paginateDto);
        const data: GetSpaceResponseDto[] = spaces.map(space => {
            return {
                id: space.id,
                name: space.name,
                location: space.location,
                description: space.description,
            };
        });
        const totalCount = await this.spaceRepository.findSpaceCount();
        const {
            totalPage, hasNextPage,
        } = this.getPaginateInfo(paginateDto, totalCount);

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

    async updateSpace(id: string, dto: UpdateSpaceRequestDto): Promise<CreateSpaceResponseDto> {
        const space = await this.spaceRepository.findSpaceById(id);
        if (!space) throw new SpaceNotFoundException(`id: ${id}`);

        if (dto?.name) {
            const overlapSpace = await this.spaceRepository.findSpaceByName(dto.name);
            if (overlapSpace) throw new DuplicateException(`name: ${dto.name}`);
        }

        const updatedSpace: SpaceEntity = {
            ...space,
            ...dto,
        };
        const resultId = await this.spaceRepository.updateSpace(updatedSpace);

        return {
            id: resultId,
        };
    }

    async deleteSpace(id: string): Promise<null> {
        const space = await this.spaceRepository.findSpaceById(id);
        if (!space) throw new SpaceNotFoundException(`id: ${id}`);

        await this.spaceRepository.deleteSpace(space.id);

        return null;
    }

    private async savePhoto(id: string, file: Express.Multer.File): Promise<{fileId: string, filePath: string}> {
        const strings = file.originalname.split(".");
        const ext = strings[strings.length - 1];
        const fileId = uuidFunction.v4();
        const fileKey = `${this.configService.get("AWS_BUCKET_KEY_ENV")}/spaces/${id}/photos/${fileId}`;
        const filePath = `https://s3.${this.configService.get("AWS_REGION")}.amazonaws.com/${this.configService.get("AWS_BUCKET_NAME")}/${fileKey}`;

        const command = new PutObjectCommand({
            Bucket: this.configService.get("AWS_BUCKET_NAME"), // S3 버킷 이름
            Key: fileKey, // 업로드될 파일의 이름
            Body: file.buffer, // 업로드할 파일
            ACL: "public-read", // 파일 접근 권한
            ContentType: `image/${ext}`, // 파일 타입
        });
        await this.s3Client.send(command);

        return {
            fileId,
            filePath,
        };
    }

    private getPaginateInfo(paginateDto: PaginateRequestDto, totalCount: number): {
        totalPage: number,
        hasNextPage: boolean
    } {
        const totalPage = Math.ceil(totalCount / paginateDto.limit);
        const hasNextPage = paginateDto.page < totalPage;

        return {
            totalPage,
            hasNextPage,
        };
    }
    
}