import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const ReserveDescriptionSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "Description",
            required: true,
            example: "기획팀 정기 회의를 위한 예약입니다.",
        })
    );
};