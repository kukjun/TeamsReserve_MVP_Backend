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
import {
    IdValidateDecorator, 
} from "@root/util/decorators/validate/id.validate.decorator";
import {
    DescriptionValidateDecorator,
} from "@root/util/decorators/validate/descriptionValidateDecorator";
import {
    IsNotEmpty, 
} from "class-validator";

export class CreateReserveRequestDto {
    @SpaceIdSwaggerDecorator()
    @IdValidateDecorator("space")
    spaceId!: string;

    @MemberIdSwaggerDecorator()
    @IdValidateDecorator("member")
    memberId!: string;

    @StartTimeSwaggerDecorator()
    @IsNotEmpty()
    // TODO: 시작 시간 Validate 필요 (현재 시간보다 이전 X)
    startTime!: string;

    @EndTimeSwaggerDecorator()
    @IsNotEmpty()
    // TODO: 종료 시간 Validate 필요 (현재 시간보다 한달 이후 X)
    endTime!: string;

    @ReserveDescriptionSwaggerDecorator()
    @DescriptionValidateDecorator()
    description?: string | null;
}