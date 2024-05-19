import {
    ApiProperty, 
} from "@nestjs/swagger";

export class CreateReserveResponseDto {
    @ApiProperty({
        type: String,
        description: "Response Reserve Id",
        required: true,
        example: "UUID",
    })
    id: string;
}