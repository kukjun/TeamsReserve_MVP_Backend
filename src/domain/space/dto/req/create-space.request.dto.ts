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
import {
    SpaceNameValidateDecorator, 
} from "@root/util/decorators/validate/space/space-name.validate.decorator";
import {
    SpaceLocationValidateDecorator, 
} from "@root/util/decorators/validate/space/space-location.validate.decorator";
import {
    DescriptionValidateDecorator, 
} from "@root/util/decorators/validate/descriptionValidateDecorator";

export class CreateSpaceRequestDto implements Pick<SpaceEntity, "name" | "location"> {
    @SpaceNameSwaggerDecorator()
    @SpaceNameValidateDecorator()
    name!: string;

    @SpaceLocationSwaggerDecorator()
    @SpaceLocationValidateDecorator()
    location: string;

    @SpaceDescriptionSwaggerDecorator()
    @DescriptionValidateDecorator()
    description?: string | null;
}