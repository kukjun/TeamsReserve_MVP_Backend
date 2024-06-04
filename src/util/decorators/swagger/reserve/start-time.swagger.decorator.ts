import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const StartTimeSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "Start Time",
            required: true,
            example: "2024-03-01T10:00",
        })
    );
};