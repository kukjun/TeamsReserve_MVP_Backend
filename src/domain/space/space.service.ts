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

@Injectable()
export class SpaceService {
    constructor(
        private readonly spaceRepository: SpaceRepository,
        private readonly photoRepository: PhotoRepository,
    ) {
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

}