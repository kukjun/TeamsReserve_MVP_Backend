import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const SpaceDescriptionSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "공간에 대한 설명",
            required: true,
            nullable: true,
            example: "이 공간은 40여명을 수용할 수 있고, 화이트보드가 있습니다.",
        })
    );
};