import {
    CreateSpaceRequestDto, 
} from "./create-space.request.dto";
import {
    PartialType, 
} from "@nestjs/swagger";

export class UpdateSpaceRequestDto extends PartialType(CreateSpaceRequestDto) {
}