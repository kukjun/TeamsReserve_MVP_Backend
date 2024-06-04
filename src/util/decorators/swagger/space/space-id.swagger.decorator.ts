import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const SpaceIdSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "Space Id",
            required: true,
            example: "ebbadaa0-8361-448b-93bc-c6f3b6d0c148",
        })
    );
};