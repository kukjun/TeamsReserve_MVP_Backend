import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const ReserveLogIdSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "Reserve Log Id",
            required: true,
            example: "ebbadaa0-8361-448b-93bc-c6f3b6d1c152",
        })
    );
};