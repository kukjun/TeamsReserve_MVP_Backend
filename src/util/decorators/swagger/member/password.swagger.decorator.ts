import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const PasswordSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "비밀번호",
            required: true,
            example: "test123!@",
        })
    );
};