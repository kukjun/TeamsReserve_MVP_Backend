import {
    ApiProperty, 
} from "@nestjs/swagger";

export class CreateReserveRequestDto {
    @ApiProperty({
        type: String,
        description: "Space Id",
        required: true,
        example: "UUID",
    })
    spaceId!: string;
    @ApiProperty({
        type: String,
        description: "Member Id",
        required: true,
        example: "UUID",
    })
    memberId!: string;
    @ApiProperty({
        type: String,
        description: "Start Time",
        required: true,
        example: "2024-03-01T10:00",
    })
    startTime!: string;
    @ApiProperty({
        type: String,
        description: "End Time",
        required: true,
        example: "2024-03-01T12:00",
    })
    endTime!: string;
    @ApiProperty({
        type: String,
        description: "Description",
        required: true,
        example: "기획팀 정기 회의를 위한 예약입니다.",
    })
    description: string | null;
}