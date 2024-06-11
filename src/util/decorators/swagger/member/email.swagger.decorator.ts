import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const EmailSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "이메일",
            required: true,
            example: "test123@naver.com",
        })
    );
};