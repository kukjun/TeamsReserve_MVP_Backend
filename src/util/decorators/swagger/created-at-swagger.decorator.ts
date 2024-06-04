import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const CreatedAtSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "생성 시간",
            required: true,
            example: "2024-05-20 01:30:00.847",
        })
    );
};