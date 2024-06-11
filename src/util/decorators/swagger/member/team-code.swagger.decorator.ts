import {
    applyDecorators,
} from "@nestjs/common";
import {
    ApiProperty,
} from "@nestjs/swagger";

export const TeamCodeSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "팀 코드",
            required: true,
            example: "ABCDEF-001",
        })
    );
};