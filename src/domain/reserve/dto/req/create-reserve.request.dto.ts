import {
    MemberIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/member-id.swagger.decorator";
import {
    SpaceIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/space/space-id.swagger.decorator";
import {
    StartTimeSwaggerDecorator, 
} from "@root/util/decorators/swagger/reserve/start-time.swagger.decorator";
import {
    EndTimeSwaggerDecorator, 
} from "@root/util/decorators/swagger/reserve/end-time.swagger.decorator";
import {
    ReserveDescriptionSwaggerDecorator,
} from "@root/util/decorators/swagger/reserve/reserve-description.swagger.decorator";

export class CreateReserveRequestDto {
    @SpaceIdSwaggerDecorator()
    spaceId!: string;

    @MemberIdSwaggerDecorator()
    memberId!: string;

    @StartTimeSwaggerDecorator()
    startTime!: string;

    @EndTimeSwaggerDecorator()
    endTime!: string;

    @ReserveDescriptionSwaggerDecorator()
    description: string | null;
}