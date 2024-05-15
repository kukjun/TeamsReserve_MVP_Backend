import {
    ApiProperty, 
} from "@nestjs/swagger";

export class CreateSpaceResponseDto {
    @ApiProperty({
        type: String,
        description: "id",
        required: true,
        example: "UUID",
    })
    id: string;
}