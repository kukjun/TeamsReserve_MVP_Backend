import {
    ReserveEntity, 
} from "../entity/reserve.entity";

export class ReserveDomain {
    constructor(
        readonly id: string,
        readonly times: string,
        readonly description: string | null,
        readonly createdAt: Date,
        readonly lastModifiedTime: Date
    ) {
    }

    toEntity() {
        return new ReserveEntity(
            this.id,
            this.times,
            this.description,
            this.createdAt,
            this.lastModifiedTime,
        );
    }
}