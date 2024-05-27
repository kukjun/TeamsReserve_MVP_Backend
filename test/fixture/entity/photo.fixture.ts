import {
    PhotoEntity, 
} from "@space/entity/photo.entity";
import {
    uuidFunction, 
} from "@root/util/function/uuid.function";

export const photoFixture = (spaceId: string, name: string = "e2ePhotoName") => {
    return new PhotoEntity(
        {
            id: uuidFunction.v4(),
            name: name,
            path: "Test Location",
            spaceId: spaceId,
        }
    );
};