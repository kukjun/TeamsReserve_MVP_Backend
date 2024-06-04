import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const NicknameSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "닉네임",
            required: true,
            example: "테스트 닉네임",
        })
    );
};