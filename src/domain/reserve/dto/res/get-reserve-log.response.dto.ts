import {
    ReserveLogEntity, 
} from "@reserve/entity/reserve-log.entity";

export class GetReserveLogResponseDto implements Pick<ReserveLogEntity,
    "id"
    | "reservedUser"
    | "reservedSpaceName"
    | "reservedLocation"
    | "reservedTimes"
    | "state"> {
    readonly id: string;
    readonly reservedUser: string;
    readonly reservedSpaceName: string;
    readonly reservedLocation: string;
    readonly reservedTimes: string;
    readonly state: string;
    readonly createdAt: string;
}