import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const SpaceNameSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "예약한 장소",
            required: true,
            example: "미래 우주 통합관",
        })
    );
};