import {
    ReserveLogEntity, 
} from "@reserve/entity/reserve-log.entity";
import {
    ReserveState, 
} from "@root/types/enums/reserve-state";

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