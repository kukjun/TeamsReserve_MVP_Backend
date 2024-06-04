import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const CodeSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "인증 코드",
            required: true,
            example: "102741",
        }));
};