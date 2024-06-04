import {
    ApiProperty,
} from "@nestjs/swagger";
import {
    applyDecorators,
} from "@nestjs/common";

export const AuthoritySwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "권한",
            required: true,
            example: "USER",
        })
    );
};