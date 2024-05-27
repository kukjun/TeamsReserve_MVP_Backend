import {
    ReserveEntity, 
} from "@reserve/entity/reserve.entity";

export class GetReserveResponseDto
implements Pick<ReserveEntity, "id" | "description"> {
    readonly id: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly description: string;
}