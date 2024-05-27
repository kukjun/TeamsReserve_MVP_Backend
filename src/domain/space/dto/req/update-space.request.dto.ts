import {
    PartialType, 
} from "@nestjs/swagger";
import {
    CreateSpaceRequestDto, 
} from "@space/dto/req/create-space.request.dto";

export class UpdateSpaceRequestDto extends PartialType(CreateSpaceRequestDto) {
}