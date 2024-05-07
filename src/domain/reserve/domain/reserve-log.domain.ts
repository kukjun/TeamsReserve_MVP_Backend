import {
    ReserveLogEntity, 
} from "../entity/reserve-log.entity";

export class ReserveLogDomain {
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

    toEntity() {
        return new ReserveLogEntity(
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