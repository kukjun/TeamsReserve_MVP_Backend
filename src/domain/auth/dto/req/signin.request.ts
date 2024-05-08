import {
    IsEmail, IsNotEmpty,
} from "class-validator";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class SigninRequest {
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
        description: "비밀번호",
        required: true,
        example: "test123!@",
    })
    @IsNotEmpty()
    password!: string;
}