import {
    PickType,
} from "@nestjs/swagger";
import {
    PhotoEntity,
} from "../../entity/photo.entity";

export class GetPhotoResponseDto extends PickType(PhotoEntity, ["id",
    "path",
    "name",]) {
}