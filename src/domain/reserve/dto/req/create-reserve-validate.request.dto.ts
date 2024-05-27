import {
    ApiProperty,
    PickType,
} from "@nestjs/swagger";
import {
    IsNotEmpty, IsOptional,
} from "class-validator";
import {
    ReserveEntity, 
} from "@reserve/entity/reserve.entity";

export class CreateReserveValidateRequestDto extends PickType(ReserveEntity, [
    "startTime",
    "endTime",
    "description",
]) {
    @ApiProperty({
        type: String,
        description: "Space Id",
        required: true,
        example: "UUID",
    })
    @IsNotEmpty()
    spaceId!: string;
    @ApiProperty({
        type: String,
        description: "Member Id",
        required: true,
        example: "UUID",
    })
    @IsNotEmpty()
    memberId!: string;
    @ApiProperty({
        type: String,
        description: "Start Time",
        required: true,
        example: "2024-03-01T10:00",
    })
    @IsNotEmpty()
    startTime!: Date;
    @ApiProperty({
        type: String,
        description: "End Time",
        required: true,
        example: "2024-03-01T12:00",
    })
    @IsNotEmpty()
    endTime!: Date;
    @ApiProperty({
        type: String,
        description: "Description",
        required: true,
        example: "기획팀 정기 회의를 위한 예약입니다.",
    })
    @IsOptional()
    description: string | null;
}