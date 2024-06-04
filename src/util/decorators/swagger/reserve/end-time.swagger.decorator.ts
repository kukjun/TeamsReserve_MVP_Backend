import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const EndTimeSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "End Time",
            required: true,
            example: "2024-03-01T12:00",
        })
    );
};
