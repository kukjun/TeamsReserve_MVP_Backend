import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const ReserveLogStateSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "예약로그 상태",
            required: true,
            example: "RESERVE",
        })
    );
};