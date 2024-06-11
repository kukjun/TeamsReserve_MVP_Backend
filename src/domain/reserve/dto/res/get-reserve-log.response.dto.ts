import {
    ReserveLogEntity, 
} from "@reserve/entity/reserve-log.entity";
import {
    ReserveLogIdSwaggerDecorator,
} from "@root/util/decorators/swagger/reserve/reserve-log/reserve-log-id.swagger.decorator";
import {
    ReservedUserSwaggerDecorator,
} from "@root/util/decorators/swagger/reserve/reserve-log/reserved-user.swagger.decorator";
import {
    SpaceNameSwaggerDecorator,
} from "@root/util/decorators/swagger/space/space-name-swagger.decorator";
import {
    SpaceLocationSwaggerDecorator,
} from "@root/util/decorators/swagger/space/space-location-swagger.decorator";
import {
    ReservedTimeSwaggerDecorator,
} from "@root/util/decorators/swagger/reserve/reserve-log/reserved-time.swagger.decorator";
import {
    ReserveLogStateSwaggerDecorator,
} from "@root/util/decorators/swagger/reserve/reserve-log/reserve-log-state.swagger.decorator";
import {
    CreatedAtSwaggerDecorator, 
} from "@root/util/decorators/swagger/created-at-swagger.decorator";

export class GetReserveLogResponseDto implements Pick<ReserveLogEntity,
    "id"
    | "reservedUser"
    | "reservedSpaceName"
    | "reservedLocation"
    | "reservedTimes"
    | "state"> {
    @ReserveLogIdSwaggerDecorator()
    readonly id: string;

    @ReservedUserSwaggerDecorator()
    readonly reservedUser: string;

    @SpaceNameSwaggerDecorator()
    readonly reservedSpaceName: string;

    @SpaceLocationSwaggerDecorator()
    readonly reservedLocation: string;

    @ReservedTimeSwaggerDecorator()
    readonly reservedTimes: string;

    @ReserveLogStateSwaggerDecorator()
    readonly state: string;

    @CreatedAtSwaggerDecorator()
    readonly createdAt: string;
}