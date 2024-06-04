import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const JoinStatusSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: Boolean,
            description: "가입여부",
            required: false,
            example: true,
        })
    );
};