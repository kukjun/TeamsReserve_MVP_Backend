import {
    ReserveLogEntity, 
} from "../../../src/domain/reserve/entity/reserve-log.entity";
import {
    ReserveState, 
} from "../../../src/types/enums/reserveState";

export const reserveLogFixture =
    (count: number) => {
        return new ReserveLogEntity({
            reservedUser: `reservedUser${count}`,
            reservedSpaceName: `reservedSpaceName${count}`,
            reservedLocation: `reservedLocation${count}`,
            reservedTimes: `reservedTimes${count}`,
            state: ReserveState.RESERVE,
        });

    };