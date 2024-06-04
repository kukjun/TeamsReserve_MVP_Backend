import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const AccessTokenSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "access token",
            required: true,
            example: "accessToken",
        })
    );
};