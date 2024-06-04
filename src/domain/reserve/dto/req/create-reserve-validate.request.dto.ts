import {
    PickType,
} from "@nestjs/swagger";
import {
    IsNotEmpty, IsOptional,
} from "class-validator";
import {
    ReserveEntity, 
} from "@reserve/entity/reserve.entity";
import {
    SpaceIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/space/space-id.swagger.decorator";
import {
    MemberIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/member-id.swagger.decorator";
import {
    StartTimeSwaggerDecorator, 
} from "@root/util/decorators/swagger/reserve/start-time.swagger.decorator";
import {
    EndTimeSwaggerDecorator, 
} from "@root/util/decorators/swagger/reserve/end-time.swagger.decorator";
import {
    ReserveDescriptionSwaggerDecorator,
} from "@root/util/decorators/swagger/reserve/reserve-description.swagger.decorator";

export class CreateReserveValidateRequestDto extends PickType(ReserveEntity, [
    "startTime",
    "endTime",
    "description",
]) {
    @SpaceIdSwaggerDecorator()
    @IsNotEmpty()
    spaceId!: string;

    @MemberIdSwaggerDecorator()
    @IsNotEmpty()
    memberId!: string;

    @StartTimeSwaggerDecorator()
    @IsNotEmpty()
    startTime!: Date;

    @EndTimeSwaggerDecorator()
    @IsNotEmpty()
    endTime!: Date;
    
    @ReserveDescriptionSwaggerDecorator()
    @IsOptional()
    description: string | null;
}