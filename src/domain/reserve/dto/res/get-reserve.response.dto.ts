import {
    ReserveEntity, 
} from "@reserve/entity/reserve.entity";
import {
    ReserveDescriptionSwaggerDecorator,
} from "@root/util/decorators/swagger/reserve/reserve-description.swagger.decorator";
import {
    EndTimeSwaggerDecorator, 
} from "@root/util/decorators/swagger/reserve/end-time.swagger.decorator";
import {
    StartTimeSwaggerDecorator, 
} from "@root/util/decorators/swagger/reserve/start-time.swagger.decorator";
import {
    ReserveIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/reserve/reserve-id.swagger.decorator";

export class GetReserveResponseDto
implements Pick<ReserveEntity, "id" | "description"> {
    @ReserveIdSwaggerDecorator()
    readonly id: string;
    @StartTimeSwaggerDecorator()
    readonly startTime: string;
    @EndTimeSwaggerDecorator()
    readonly endTime: string;
    @ReserveDescriptionSwaggerDecorator()
    readonly description: string;
}