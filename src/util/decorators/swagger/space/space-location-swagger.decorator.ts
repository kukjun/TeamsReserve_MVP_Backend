import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const SpaceLocationSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "예약한 위치",
            required: true,
            example: "화성 C130-1",
        })
    );
};