import {
    IsEmail, IsNotEmpty, 
} from "class-validator";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class ValidateEmailRequest {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        type: String,
        description: "이메일",
        required: true,
        example: "test123@naver.com", 
    })
    email!: string;
}