import {
    ApiProperty, 
} from "@nestjs/swagger";

export class CreatePhotoResponseDto {
    @ApiProperty({
        type: String,
        description: "photo UUID 반환",
        required: true,
        example: "UUID",
    })
    id: string;
}