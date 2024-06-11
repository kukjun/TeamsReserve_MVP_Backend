import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const MemberIdSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "Member id",
            required: true,
            example: "ebbadaa0-8361-448b-93bc-c6f3b6d0c142",
        })
    );
};