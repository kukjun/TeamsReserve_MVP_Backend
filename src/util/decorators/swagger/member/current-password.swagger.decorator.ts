import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const CurrentPasswordSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "변경 이전의 비밀번호",
            required: true,
            example: "test123!@",
        })
    );
};