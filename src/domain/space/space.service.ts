import {
    Injectable, 
} from "@nestjs/common";
import {
    SpaceRepository, 
} from "./space.repository";
import {
    PhotoRepository, 
} from "./photo.repository";
import {
    CreateSpaceRequestDto, 
} from "./dto/req/create-space.request.dto";
import {
    CreateSpaceResponseDto, 
} from "./dto/res/create-space.response.dto";
import {
    DuplicateException, 
} from "../../exception/duplicate.exception";
import {
    SpaceEntity, 
} from "./entity/space.entity";
import {
    CreatePhotoResponseDto, 
} from "./dto/res/create-photo.response.dto";
import {
    ConfigService, 
} from "@nestjs/config";
import {
    uuidFunction, 
} from "../../util/function/uuid.function";
import {
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import {
    SpaceNotFoundException, 
} from "../../exception/space-not-found.exception";
import {
    PhotoEntity, 
} from "./entity/photo.entity";

@Injectable()
export class SpaceService {
    s3Client: S3Client;

    constructor(
        private readonly configService: ConfigService,
        private readonly spaceRepository: SpaceRepository,
        private readonly photoRepository: PhotoRepository,
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
        // 동일 이름의 space가 있는지 조회
        const space = await this.spaceRepository.findSpaceByName(dto.name);
        if(space) throw new DuplicateException(`name: ${dto.name} space`);

        const newSpace = new SpaceEntity(dto);

        const resultId = await this.spaceRepository.saveSpace(newSpace);

        return {
            id: resultId,
        };
    }

    async createPhoto(id: string, file: Express.Multer.File): Promise<CreatePhotoResponseDto> {
        const space = await this.spaceRepository.findSpaceById(id);
        if(!space) throw new SpaceNotFoundException(`id: ${id}`);

        const strings = file.originalname.split(".");
        const ext = strings[strings.length-1];
        const fileId = uuidFunction.v4();
        const fileKey = `${this.configService.get("AWS_BUCKET_KEY_ENV")}/sapces/${id}/photos/${fileId}`;

        const command = new PutObjectCommand({
            Bucket: this.configService.get("AWS_BUCKET_NAME"), // S3 버킷 이름
            Key: fileKey, // 업로드될 파일의 이름
            Body: file.buffer, // 업로드할 파일
            ACL: "public-read", // 파일 접근 권한
            ContentType: `image/${ext}`, // 파일 타입
        });
        await this.s3Client.send(command);

        const photoEntity: PhotoEntity = new PhotoEntity({
            id: fileId,
            path: `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${fileKey}`,
            name: file.originalname,
            spaceId: space.id,
        });
        const resultId = await this.photoRepository.save(photoEntity);

        return {
            id: resultId,
        };

    }

}