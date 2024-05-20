import {
    ApiProperty, 
} from "@nestjs/swagger";
import {
    IsNotEmpty, IsString,
} from "class-validator";

export class ReserveOptionDto {
    @ApiProperty({
        type: String,
        description: "해당하는 공간 ID",
        required: false,
        example: true,
    })
    @IsNotEmpty()
    @IsString()
    spaceId: string;
}