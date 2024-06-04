import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const ReservedTimeSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "예약한 시간",
            required: true,
            example: "2024-05-30T03:00:00.000Z - 2024-05-30T03:30:00.000Z",
        })
    );
};