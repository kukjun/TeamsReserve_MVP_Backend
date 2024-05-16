import {
    SpaceEntity,
} from "../../../src/domain/space/entity/space.entity";

export const spaceFixture
    = (name: string = "e2eName", location: string = "e2e location name", description: string = null): SpaceEntity => {
        return new SpaceEntity(
            {
                name,
                location,
                description,
            }
        );
    };

export const spaceRandomFixture
    = (count: number = 0) => {
        return new SpaceEntity({
            name: `e2eName${count}`,
            location: `e2e location name${count}`,
            description: `e2e description${count}`,
        });
    };