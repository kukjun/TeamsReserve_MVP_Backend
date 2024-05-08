import {
    ApiProperty, 
} from "@nestjs/swagger";

export class SigninResponse {
        @ApiProperty({
            type: String,
            description: "access token",
            required: true,
            example: "accessToken",
        })
        accessToken: string;
}