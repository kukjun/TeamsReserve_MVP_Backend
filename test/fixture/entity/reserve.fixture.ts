import {
    ReserveEntity, 
} from "../../../src/domain/reserve/entity/reserve.entity";

export const reserveFixture
= (memberId: string, spaceId: string, startTime:Date, endTime:Date, description: string = null): ReserveEntity => {
    return new ReserveEntity({
        startTime,
        endTime,
        description,
        spaceId,
        memberId,
    });
};