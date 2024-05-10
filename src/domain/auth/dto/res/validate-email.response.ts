import {
    ApiProperty, 
} from "@nestjs/swagger";

export class ValidateEmailResponse {
        @ApiProperty({
            type: String,
            description: "이메일",
            required: true,
            example: "test123@naver.com",
        })
        email: string;
}