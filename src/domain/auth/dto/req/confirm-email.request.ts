import {
    IsEmail, IsNotEmpty,
} from "class-validator";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class ConfirmEmailRequest {
    @ApiProperty({
        type: String,
        description: "이메일",
        required: true,
        example: "test123@naver.com",
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;
    @ApiProperty({
        type: String,
        description: "인증 코드",
        required: true,
        example: "102741",
    })
    @IsNotEmpty()
    code!: string;
}