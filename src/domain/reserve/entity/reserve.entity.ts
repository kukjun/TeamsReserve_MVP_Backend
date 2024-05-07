import {
    Reserve, 
} from "@prisma/client";
import {
    ReserveDomain, 
} from "../domain/reserve.domain";

export class ReserveEntity implements Reserve {
    constructor(
        readonly id: string,
        readonly times: string,
        readonly description: string | null,
        readonly createdAt: Date,
        readonly lastModifiedTime: Date,
    ) {
    }

    toDomain() {
        return new ReserveDomain(
            this.id,
            this.times,
            this.description,
            this.createdAt,
            this.lastModifiedTime,
        );
    }
}