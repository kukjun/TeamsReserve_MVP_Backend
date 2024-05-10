import {
    ApiProperty, 
} from "@nestjs/swagger";

export class SignupResponse {
        @ApiProperty({
            type: String,
            description: "Member id",
            required: true,
            example: "uuid",
        })
        id: string;
}