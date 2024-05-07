import {
    ReserveLog,
} from "@prisma/client";
import {
    ReserveLogDomain, 
} from "../domain/reserve-log.domain";

export class ReserveLogEntity implements ReserveLog {
    constructor(
        readonly id: string,
        readonly reservedUser: string,
        readonly reservedSpaceName: string,
        readonly reservedLocation: string,
        readonly reservedTimes: string,
        readonly state: string,
        readonly createdAt: Date,
        readonly lastModifiedTime: Date
    ) {
    }

    toDomain() {
        return new ReserveLogDomain(
            this.id,
            this.reservedUser,
            this.reservedSpaceName,
            this.reservedLocation,
            this.reservedTimes,
            this.state,
            this.createdAt,
            this.lastModifiedTime,
        );
    }

}