import {
    SpaceEntity, 
} from "../entity/space.entity";

export class SpaceDomain {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly location: string,
        readonly description: string | null,
        readonly createdAt: Date,
        readonly lastModifiedTime: Date
    ) {}

    toEntity() {
    
        return new SpaceEntity(
            this.id,
            this.name,
            this.location,
            this.description,
            this.createdAt,
            this.lastModifiedTime
        );
    }
}
