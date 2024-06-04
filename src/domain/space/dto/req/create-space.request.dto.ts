import {
    IsNotEmpty, IsOptional,
} from "class-validator";
import {
    SpaceEntity, 
} from "@space/entity/space.entity";
import {
    SpaceNameSwaggerDecorator, 
} from "@root/util/decorators/swagger/space/space-name-swagger.decorator";
import {
    SpaceLocationSwaggerDecorator, 
} from "@root/util/decorators/swagger/space/space-location-swagger.decorator";
import {
    SpaceDescriptionSwaggerDecorator,
} from "@root/util/decorators/swagger/space/space-description.swagger.decorator";

export class CreateSpaceRequestDto implements Pick<SpaceEntity, "name" | "location"> {
    @SpaceNameSwaggerDecorator()
    @IsNotEmpty()
    name!: string;

    @SpaceLocationSwaggerDecorator()
    @IsNotEmpty()
    location: string;

    @SpaceDescriptionSwaggerDecorator()
    @IsOptional()
    description?: string | null;
}