import {
    Space,
} from "@prisma/client";
import {
    SpaceDomain,
} from "../domain/space.domain";

export class SpaceEntity implements Space {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly location: string,
        readonly description: string | null,
        readonly createdAt: Date,
        readonly lastModifiedTime: Date
    ) {
    }

    toDomain() {
        return new SpaceDomain(
            this.id,
            this.name,
            this.location,
            this.description,
            this.createdAt,
            this.lastModifiedTime
        );
    }
}