import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const ReservedUserSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "예약한 유저",
            required: true,
            example: "김가나",
        })
    );
};