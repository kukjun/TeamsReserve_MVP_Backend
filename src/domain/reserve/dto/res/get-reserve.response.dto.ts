import {
    ReserveEntity,
} from "../../entity/reserve.entity";

export class GetReserveResponseDto
implements Pick<ReserveEntity, "id" | "startTime" | "endTime" | "description"> {
    readonly id;
    readonly startTime;
    readonly endTime;
    readonly description;
}