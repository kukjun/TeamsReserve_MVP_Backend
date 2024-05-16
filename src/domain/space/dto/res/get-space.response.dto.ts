import {
    PickType, 
} from "@nestjs/swagger";
import {
    SpaceEntity, 
} from "../../entity/space.entity";

export class GetSpaceResponseDto extends PickType(SpaceEntity, ["id",
    "name",
    "location",
    "description",]) {}